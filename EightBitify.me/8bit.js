var canvas = document.getElementById('can');
var ctx = canvas.getContext('2d');
var localMediaStream = null;

vid.addEventListener('click', capture, false);

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
    var image = ctx.getImageData(0,0,canvas.width, canvas.height);
    for(var dp = 0; dp < image.data.length; dp += 4)
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

    ctx.putImageData(image, 0, 0);
}