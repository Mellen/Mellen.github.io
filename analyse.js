var canvas = document.getElementById('canvas');
var canvEdge = document.getElementById('edges');
var vid = document.getElementById('vid');

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
    for(var pi = 0; pi < colourField.data.length; pi += 4)
    {
	colourScore += colourField.data[pi];
    }
    var mean = colourScore / pixelCount;
    var distsFromMeanSquared = [];

    for(var pi = 0; pi < colourField.data.length; pi+=4)
    {	
	var redVal = colourField.data[pi];
	distsFromMeanSquared.push((redVal - mean) * (redVal - mean));
    }

    stdDev = Math.sqrt(distsFromMeanSquared.reduce(function(a,b){return a+b;}) / distsFromMeanSquared.length);

    for(var pi = 0; pi < edges.data.length; pi+=4)
    {
	if(pi % (colourField.width*4) != (colourField.width * 4))
	{
	    var redVal1 = colourField.data[pi];

	    var redVal2 = colourField.data[pi+4];

	    var scale = Math.abs(redVal1 - redVal2) / stdDev;
	    edges.data[pi] = Math.floor(255 * scale);
	    edges.data[pi+1] = Math.floor(255 * scale);
	    edges.data[pi+2] = Math.floor(255 * scale);
	}
	edges.data[pi+3] = 255;
    }

    var width = edges.width * 4;

    for(var pi = 0; pi < edges.data.length; pi+=4)
    {
	if(pi < (edges.data.length - (width)))
	{
	    var redVal1 = colourField.data[pi];

	    var redVal2 = colourField.data[pi+width];

	    var scale = Math.abs(redVal1 - redVal2) / stdDev;
	    edges.data[pi] += Math.floor(255 * scale);
	    edges.data[pi+1] += Math.floor(255 * scale);
	    edges.data[pi+2] += Math.floor(255 * scale);
	}
	edges.data[pi+3] = 255;
    }	
}

