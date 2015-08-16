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
	    let red = image.data[dp];
	    let green = image.data[dp+1];
	    let blue = image.data[dp+2];

	    let rng = 32;
	    let b = 64;
	    
	    let newRed = Math.floor(red / rng) * rng;
	    let newGreen = Math.floor(green / rng) * rng;
	    let newBlue = Math.floor(blue / b) * b;

	    image.data[dp] = newRed;
	    image.data[dp+1] = newGreen;
	    image.data[dp+2] = newBlue;
	}

	var pixelWidth = 6;

	var maxX = image.width/pixelWidth;
	var maxY = image.height/pixelWidth;

	var pixelCount = pixelWidth * pixelWidth;

	for(let x = 0; x < maxX; x++)
	{
	    for(let y = 0; y < maxY; y++)
	    {
		let colourSumR = 0;
		let colourSumG = 0;
		let colourSumB = 0;

		let currentIndex = (x*pixelWidth + y*pixelWidth*image.width) * 4;

		for(let innerX = 0; innerX < pixelWidth; innerX++)
		{
		    for(let innerY = 0; innerY < pixelWidth; innerY++)
		    {
			let extraIndex = (innerX + innerY * image.width) * 4;
			let totalIndex = currentIndex + extraIndex;
			colourSumR += image.data[totalIndex];
			colourSumG += image.data[totalIndex+1];
			colourSumB += image.data[totalIndex+2];
		    }
		}

		let avgR = Math.floor(colourSumR / pixelCount);
		let avgG = Math.floor(colourSumG / pixelCount);
		let avgB = Math.floor(colourSumB / pixelCount);

		for(let innerX = 0; innerX < pixelWidth; innerX++)
		{
		    for(let innerY = 0; innerY < pixelWidth; innerY++)
		    {
			let extraIndex = (innerX + innerY * image.width) * 4;
			let totalIndex = currentIndex + extraIndex;
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
})();