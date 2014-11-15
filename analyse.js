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
	var redPixels = edgeCtx.createImageData(canvEdge.width, canvEdge.height);
	getColour(pixels, redPixels, red);
	var ratios = calculateRatios(pixels);
	console.log(ratios);
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

function calculateRatios(colourField)
{
    var w = colourField.width;
    var h = colourField.height;

    var avgs = [];
    var rowSum = 0;

    for(var i = 0, rp = 0; i < colourField.data.length; i+=4)
    {
	if(rp == w)
	{
	    avgs.push(rowSum/w);
	    rowSum = 0;
	    rp = 0;
	}
	else
	{
	    rowSum += colourField.data[i];
	    rp++
	}
    }

    var normAvgs = [];

    var maxAvg = Math.max.apply(null, avgs);

    for(var i = 0; i < avgs.length; i++)
    {
	normAvgs.push(avgs[i]/maxAvg);
    }

    var threshold = 0.5;

    edgeIndices = []
    for(var i = 0; i < normAvgs.length - 1; i++)
    {
	if ((normAvgs[i] <= threshold && normAvgs[i+1] > threshold) || (normAvgs[i] > threshold && normAvgs[i+1] <= threshold))
	{
	    edgeIndices.push(i);
	}
    }

    console.log(edgeIndices)

    if(edgeIndices.length < 4)
    {
	console.log('not enough edge');
	return {};
    }

    var control = getDrop(edgeIndices[0] + 5, edgeIndices[1] - 5, normAvgs)
    
    var patient = getDrop(Math.floor(edgeIndices[2] + 0.50 * (edgeIndices[3] - edgeIndices[2])), Math.floor(edgeIndices[2] + 0.80 * (edgeIndices[3] - edgeIndices[2])), normAvgs);
   
    var ratio = patient / control * 100

    return { 'normalised_drop_percent': ratio, 'level': Math.floor(ratio / 20.0) };
}


function getDrop(x, y, normAvgs)
{
    var width = y - x;

    var minInControlStrip = Math.min.apply(null, normAvgs.splice(x, width));

    var minControlPosn = normAvgs.indexOf(minInControlStrip) + x;

    var controlStripHeight = normAvgs[y] - normAvgs[x];

    var proportionIntoControlStrip = (minControlPosn - x) / width;

    var calculatedValueAtMinPosn = normAvgs[x] + proportionIntoControlStrip * controlStripHeight;

    return (calculatedValueAtMinPosn - minInControlStrip);
}