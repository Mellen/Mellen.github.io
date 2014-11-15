var canvas = document.getElementById('can');
var ctx = canvas.getContext('2d');

var img = new Image();
var img2 = new Image();

img.onload = function()
{
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.drawImage(img,0,0);
    img2.src = canvas.toDataURL('image/png');
}

img2.onload = function()
{
    ctx.drawImage(img2, 0, 0);
    make8bit();
}

img.src = 'https://www.gravatar.com/avatar/ea5fb0bda281e5ddab057950eb17882a?s=512';

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