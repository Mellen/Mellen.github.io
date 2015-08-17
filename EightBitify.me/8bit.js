(function()
{
    "use strict";
    var canvas = document.getElementById('can');
    var ctx = canvas.getContext('2d');
    var vid = document.getElementById('vid');
    var localMediaStream = null;

    navigator.getUserMedia = ( navigator.getUserMedia ||
			       navigator.webkitGetUserMedia ||
			       navigator.mozGetUserMedia ||
			       navigator.msGetUserMedia);


    if(navigator.getUserMedia)
    {
	var um = navigator.getUserMedia({video: true}, handleVid, vidErr);
    }

    function handleVid(stream)
    {
	vid.src = window.URL.createObjectURL(stream);
	localMediaStream = stream;
    }

    function vidErr(e)
    {
	alert(e);
    }

    function capture()
    {
	if(localMediaStream)
	{
	    canvas.width = vid.clientWidth;
	    canvas.height = vid.clientHeight;
	    ctx.drawImage(vid, 0, 0);
	    make8bit();
	}
    }

    function make8bit()
    {
	var image = ctx.getImageData(0, 0, canvas.width, canvas.height);

	for(let dp = 0; dp < image.data.length; dp += 4)
	{
	    var red = image.data[dp];
	    var green = image.data[dp+1];
	    var blue = image.data[dp+2];

	    var rng = 32;
	    var b = 64;
	    
	    var newRed = Math.floor(red / rng) * rng;
	    var newGreen = Math.floor(green / rng) * rng;
	    var newBlue = Math.floor(blue / b) * b;

	    image.data[dp] = newRed;
	    image.data[dp+1] = newGreen;
	    image.data[dp+2] = newBlue;
	}

	var pixelWidth = 6;

	var maxX = image.width/pixelWidth;
	var maxY = image.height/pixelWidth;

	var pixelCount = pixelWidth * pixelWidth;

	for(var x = 0; x < maxX; x++)
	{
	    for(var y = 0; y < maxY; y++)
	    {
		var colourSumR = 0;
		var colourSumG = 0;
		var colourSumB = 0;

		var currentIndex = (x*pixelWidth + y*pixelWidth*image.width) * 4;

		for(var innerX = 0; innerX < pixelWidth; innerX++)
		{
		    for(var innerY = 0; innerY < pixelWidth; innerY++)
		    {
			var extraIndex = (innerX + innerY * image.width) * 4;
			var totalIndex = currentIndex + extraIndex;
			colourSumR += image.data[totalIndex];
			colourSumG += image.data[totalIndex+1];
			colourSumB += image.data[totalIndex+2];
		    }
		}

		var avgR = Math.floor(colourSumR / pixelCount);
		var avgG = Math.floor(colourSumG / pixelCount);
		var avgB = Math.floor(colourSumB / pixelCount);

		for(var innerX = 0; innerX < pixelWidth; innerX++)
		{
		    for(var innerY = 0; innerY < pixelWidth; innerY++)
		    {
			var extraIndex = (innerX + innerY * image.width) * 4;
			var totalIndex = currentIndex + extraIndex;
			image.data[totalIndex] = avgR;
			image.data[totalIndex+1] = avgG;
			image.data[totalIndex+2] = avgB;
		    }
		}	    
	    }
	}

	ctx.putImageData(image, 0, 0);
    }

    vid.style.visibility = 'hidden';

    setInterval(capture, 100);
    return true;
})();

