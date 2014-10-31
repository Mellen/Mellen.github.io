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
	/*var arrRed = Array.from(redPixels.data).filter(function(value, index, arr) { return index % 4 == 0; });
	var mean = arrRed.reduce(function(a,b){ return a+b; }) / arrRed.length;
	var distFromMeanSquared = arrRed.map(function(a){return (a-mean)*(a-mean);});
	var stdDev = Math.sqrt(distFromMeanSquared.reduce(function(a,b){ return a+b; }) / distFromMeanSquared.length);*/
	setEdges(edges, pixels);
	//calculateEdges(stdDev, redPixels, edges);
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
    var stdDevs = [];
    var pixelCount = colourField.width * colourField.height;
    for(var colour = red; colour <= blue; colour++)
    {
	var colourScore = 0;
	for(var pi = colour; pi < colourField.data.length - colour; pi += 4)
	{
	    colourScore += colourField.data[pi];
	}
	var mean = colourScore / pixelCount;
	var distsFromMeanSquared = [];
	for(var pi = colour; pi < colourField.data.length - colour; pi += 4)
	{
	    distsFromMeanSquared.push((colourField.data[pi] - mean) * (colourField.data[pi] - mean));
	}
	stdDevs.push(Math.sqrt(distsFromMeanSquared.reduce(function(a,b){return a+b;}) / distsFromMeanSquared.length));
    }

    for(var pi = 0; pi < edges.data.length; pi+=4)
    {
	if(pi % (colourField.width*4) != (colourField.width * 4))
	{
	    for(var c = red; c <= blue; c++)
	    {
		if(Math.abs(colourField.data[pi+c] - colourField.data[pi+4+c]) > (stdDevs[c] * factor))
		{
		    edges.data[pi+c] = 255;
		}
	    }
	    edges.data[pi+3] = 255;
	}	
    }
}

function calculateEdges(stdDev, red, edges)
{
    for(var pi = 0; pi < red.data.length; pi += 4)
    {
	if(pi % (red.width*4) != (red.width * 4))
	{
	    if(Math.abs(red.data[pi] - red.data[pi+4]) > (stdDev * factor))
	    {
		edges.data[pi] = 255;
	    }
	}

	edges.data[pi+3] = 255;
    }
}