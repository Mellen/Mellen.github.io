var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var canEdge = document.getElementById('edges');
var ctxEdge = canEdge.getContext('2d');

var vid = document.getElementById('vid');
var dropPercent = document.getElementById('dp');
var level = document.getElementById('level');
var localMediaStream = null;

//arbitrary values from one particular image used to produce ratios
var fullWidth = 345;
var patchWidthRatio = 143 / fullWidth;
var midBarrierWidthRatio = 66 / fullWidth;
var heightRatio = 86 / fullWidth;

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
	canEdge.width = vid.clientWidth;
	canEdge.height = vid.clientHeight;
	ctx.drawImage(vid, 0, 0);
	var pixels = ctx.getImageData(0,0, canvas.width, canvas.height);
	var edges = ctxEdge.createImageData(canEdge.width, canEdge.height);
	setEdges(edges, pixels);
	edgeIndices = getEdgeIndices(edges);

	var bounds = calculateBounds(edgeIndices, canvas.width, canvas.height);

	ctxEdge.putImageData(edges, 0, 0);

	var ratios = calculateRatios(pixels);
	console.log(ratios);
	dropPercent.innerHTML = ratios.normalised_drop_percent;
	level.innerHTML = ratios.level;
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
	return {normalised_drop_percent: 'none', level: 'none'};
    }

    var control = getDrop(edgeIndices[0] + 5, edgeIndices[1] - 5, normAvgs)
    
    var patient = getDrop(Math.floor(edgeIndices[2] + 0.50 * (edgeIndices[3] - edgeIndices[2])), Math.floor(edgeIndices[2] + 0.80 * (edgeIndices[3] - edgeIndices[2])), normAvgs);
   
    var ratio = patient / control * 100

    console.log('patient ' + patient);
    console.log('control ' + control);

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

    var limit = 0.3;

    for(var pi = 0; pi < edges.data.length; pi+=4)
    {
	if(pi % (colourField.width*4) != (colourField.width * 4))
	{
	    var redVal1 = colourField.data[pi];

	    var redVal2 = colourField.data[pi+4];

	    var scale = Math.abs(redVal1 - redVal2) / stdDev;
	    if(scale > limit)
	    {
		edges.data[pi] = Math.floor(255 );
		edges.data[pi+1] = Math.floor(255 );
		edges.data[pi+2] = Math.floor(255 );
	    }
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
	    if(scale > limit)
	    {
		edges.data[pi] += Math.floor(255 );
		edges.data[pi+1] += Math.floor(255 );
		edges.data[pi+2] += Math.floor(255 );
	    }
	}
	edges.data[pi+3] = 255;
    }	
}

function getEdgeIndices(edges)
{
    var indices = [];
    for(var i = 0; i < edges.data.length; i++)
    {
	if(edges.data[i] == 255)
	{
	    indices.push(i);
	}
    }
}

function calculateBounds(indices, width, height)
{
    var epsilon = 0.01;

    var widths = [];

    var heights = [];

    for(var i = 0; i < indices.length-1; i++)
    {
	if(Math.floor(indices[i] / width) == Math.floor(indices[i+1] / width))
	{
	    var y = Math.floor(indices[i] / width);
	    widths.push({dist:Math.abs(indices[i] - indices[i+1]), 
			 x1: indices[i]%width, 
			 x2: indices[i+1]%width, 
			 y1: y, 
			 y2: y});
	}
    }

    for(var i = 0; i < indices.length - width; i++)
    {
	if((indices[i] % width) == (indices[i + width] % width))
	{
	    var x = indices[i] % width;
	    heights.push({dist:Math.abs(indices[i] - indices[i+width]), 
		          x1: x,
			  x2: x, 
			  y1: Math.floor(indices[i]/width), 
			  y2: Math.floor(indices[i+width] / width)}));
	}
    }
}