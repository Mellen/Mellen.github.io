var canvas = document.getElementById('can');
var ctx = canvas.getContext('2d');

var img = document.getElementById('img');

canvas.width = img.width;
canvas.height = img.height;
ctx.drawImage(img,0,0);
make8bit();

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
	
	var newRed = (red % 8) * rng;
	var newGreen = (green % 8) * rng;
	var newBlue = (blue % 8) * b;

	image.data[dp] = newRed;
	image.data[dp+1] = newGreen;
	image.data[dp+2] = newBlue;
    }

    ctx.putImageData(0, 0, image);
}

