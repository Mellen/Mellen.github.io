var canvas = document.getElementById('canvas');
var canvEdge = document.getElementById('edges');
var vid = document.getElementById('vid');

var factor = Number(document.getElementById('txtFactor').value);

document.getElementById('txtFactor').addEventListener('change', function(){factor = Number(this.value);});

var ctx = canvas.getContext('2d');
var edgeCtx = canvEdge.getContext('2d');
var localMediaStream = null;

var red = 0;
var green = 1;
var blue = 2;

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
	canvEdge.width = vid.clientWidth;
	canvEdge.height = vid.clientHeight;
	ctx.drawImage(vid, 0, 0);
	var pixels = ctx.getImageData(0,0, canvas.width, canvas.height);
	var edges = edgeCtx.createImageData(canvEdge.width, canvEdge.height);
	var redPixels = edgeCtx.createImageData(canvEdge.width, canvEdge.height);
	getColour(pixels, redPixels, red);
	setEdges(edges, pixels);
	edgeCtx.putImageData(edges, 0,0);
    }
}

function getColour(pixels, colourField, colour)
{    
    for(var pi = 0; pi < pixels.data.length; pi += 4)
    {
	colourField.data[pi+colour] = pixels.data[pi+colour];
	colourField.data[pi+3] = 255;
    }
}

function setEdges(edges, colourField)
{
    var stdDev = 0;
    var pixelCount = colourField.width * colourField.height;
    var colourScore = 0;
    for(var pi = 0; pi < colourField.data.length; pi++)
    {
	if(pi%4 != 3)
	{
	    colourScore += colourField.data[pi];
	}
    }
    var mean = colourScore / (pixelCount * 3);
    var distsFromMeanSquared = [];

    for(var pi = 0; pi < colourField.data.length; pi+=4)
    {	
	var whiteVal = colourField.data[pi];
	whiteVal += colourField.data[pi+1];
	whiteVal += colourField.data[pi+2];
	distsFromMeanSquared.push((whiteVal - mean) * (whiteVal - mean));
    }

    stdDev = Math.sqrt(distsFromMeanSquared.reduce(function(a,b){return a+b;}) / distsFromMeanSquared.length);

    for(var pi = 0; pi < edges.data.length; pi+=4)
    {
	if(pi % (colourField.width*4) != (colourField.width * 4))
	{
	    var whiteVal1 = colourField.data[pi];
	    whiteVal1 += colourField.data[pi+1];
	    whiteVal1 += colourField.data[pi+2];

	    var whiteVal2 = colourField.data[pi+4];
	    whiteVal2 += colourField.data[pi+5];
	    whiteVal2 += colourField.data[pi+6];

	    if(Math.abs(whiteVal1 - whiteVal2) > (stdDev * factor))
	    {
		var scale = Math.abs(whiteVal1 - whiteVal2) / stdDev;
		edges.data[pi] = Math.floor(255 * scale);
		edges.data[pi+1] = Math.floor(255 * scale);
		edges.data[pi+2] = Math.floor(255 * scale);
	    }
	}
	    edges.data[pi+3] = 255;
    }	
}

