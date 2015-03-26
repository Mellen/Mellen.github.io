var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var canEdge = document.getElementById('edges');

var vid = document.getElementById('vid');
var dropPercent = document.getElementById('dp');
var level = document.getElementById('level');
var localMediaStream = null;

vid.addEventListener('click', capture, false);

var redi = 0;
var greeni = 1;
var bluei = 2;
var transi = 3;

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
	canvas.width = this.clientWidth;
	canvas.height = this.clientHeight;

	ctx.drawImage(this, 0, 0);

	var pixels = ctx.getImageData(0,0, canvas.width, canvas.height);
	var original = ctx.getImageData(0,0, canvas.width, canvas.height);

	var cmyk = RGBToCMYK(original.data); 

	hilightCyan(pixels, cmyk, ctx);

	var cyanRows = calcCyanRows(pixels.data, cmyk, pixels.width, pixels.height);

	var patientDimensions = calcDimensions(cyanRows, pixels);

	ctx.strokeStyle = '#ff0000';
	ctx.strokeRect(patientDimensions.x, patientDimensions.y, patientDimensions.width, patientDimensions.height)
    }
}

function calcDimensions(rows, image)
{
    var rgb = image.data;
    
    var threeCounts = [];
    for(var ri in rows)
    {
	if(rows[ri].length === 3)
	{
	    threeCounts.push(ri);
	}
    }

    if(threeCounts.length == 0)
    {
	alert('Please hold the strip more horizontally');
	return {x:0, y:0, width:0, height:0};
    }

    var result = {x:0, y:0, width:0, height:0};
    var firstWidth = 0;
    var secondWidth = 0;
    var bestLeft = 0;
    for(var tci in threeCounts)
    {
	var row = rows[threeCounts[tci]];

	var firstBit = row[0];

	var left = firstBit[firstBit.length - 1];
	
	var secondBit = row[1];

	var right = secondBit[0];

	if(firstBit.length < 10 || secondBit.length < 10)
	{
	    continue;
	}
	
	if(right - left > result.width)
	{
	    bestLeft = left;
	    result.x = left%image.width;
	    result.width = right - left;
	    firstWidth = firstBit.length;
	    secondWidth = secondBit.length;
	}
    }

    if((result.width < secondWidth)||(result.width == 0))
    {
	alert('Please hold the strip more horizontally');
	return result;
    }

    
    var startpi = (bestLeft + result.width + 10) * 4;

    var width = image.width * 4;

    for(var pi = startpi; pi > 0; pi -= width)
    {
	if(rgb[pi] + rgb[pi + 1] + rgb[pi + 2] > 0)
	{
	    result.y = Math.floor((pi/4)) / image.width;
	    result.height++;
	}
	else
	{
	    break;
	}
    }

    for(var pi = startpi; pi < rgb.length; pi += width)
    {
	if(rgb[pi] + rgb[pi + 1] + rgb[pi + 2] > 0)
	{
	    result.height++;
	}
	else
	{
	    break;
	}
    }

    return result;
}

function calcCyanRows(pixels, cmyk, realWidth, realHeight)
{
    var result = [];

    var width = realWidth * 4;

    for(var rowi = 0; rowi < realHeight; rowi++)
    {
	var startIndex = rowi * width;
	var row = [];
	var section = [];
	for(var pi = startIndex; pi < startIndex + width; pi+=4)
	{
	    if(pixels[pi] + pixels[pi + 1] + pixels[pi + 2] > 0)
	    {
		section.push(Math.floor(pi/4));
	    }
	    else
	    {
		if(section.length > 0)
		{
		    row.push(section);
		    section = [];
		}
	    }
	}

	result.push(row);
    }

    return result;
}

function hilightCyan(original, cmyk, context)
{
    for(var pi = 0; pi < cmyk.length; pi += 4)
    {
	var red = original.data[pi];
	var cyan = cmyk[pi];
	var black = cmyk[pi+3];

	if(((cyan - red) < 8))
	{
	    original.data[pi] = 0;
	    original.data[pi + 1] = 0;
	    original.data[pi + 2] = 0;
	}
    }
}

function RGBToCMYK(pixels)
{
    var result = new Uint8ClampedArray(pixels.length);

    for(var pi = 0; pi < pixels.length; pi += 4)
    {
	var r = pixels[pi]/255;
	var g = pixels[pi + 1]/255;
	var b = pixels[pi + 2]/255;

	var k = 1 - Math.max(r, g, b);
	var c = (1-r-k)/(1-k);
	var m = (1-g-k)/(1-k);
	var y = (1-b-k)/(1-k);

	result[pi] = Math.round(c * 255);
	result[pi + 1] = Math.round(m * 255);
	result[pi + 2] = Math.round(y * 255);
	result[pi + 3] = Math.round(k * 255);
    }

    return result;
}

function CMYKToRGB(pixels)
{
    var result = new Uint8ClampedArray(pixels.length);

    for(var pi = 0; pi < pixels.length; pi += 4)
    {
	var c = pixels[pi]/255;
	var m = pixels[pi + 1]/255;
	var y = pixels[pi + 2]/255;
	var k = pixels[pi + 3]/255;

	var r = (1-c) * (1-k);
	var g = (1-m) * (1-k);
	var b = (1-y) * (1-k);
	
	result[pi] = Math.round(r * 255);
	result[pi + 1] = Math.round(g * 255);
	result[pi + 2] = Math.round(b * 255);
	result[pi + 3] = 255;
    }

    return result;
}