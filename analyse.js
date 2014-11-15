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
	ctx.strokeStyle = '#ff0000';
	for(var bi = 0; bi < bounds.length; bi++)
	{
	    ctx.strokeRect(bounds[bi].x1, bounds[bi].y1, bounds[bi].x2 - bounds[bi].x1, bounds[bi].y2 - bounds[bi].y1);
	}
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
    for(var i = 0; i < edges.data.length; i+=4)
    {
	if(edges.data[i] == 255)
	{
	    indices.push(i);
	}
    }

    return indices;
}

function calculateBounds(indices, width, height)
{
    var epsilon = 0.01;

    var widths = [];

    var heights = [];

    for(var i = 0; i < indices.length-1; i++)
    {
	var index = indices[i]/4;
	var nextIndex = index;
 
	for(var oi = i+1; oi < indices.length; oi++)
	{
	    var pin = indices[oi] / 4;
	    if(Math.floor(pin / width) == Math.floor(index / width))
	    {
		nextIndex = pin;
	    }
	}

	if(nextIndex != index)
	{
	    var y = Math.floor(index / width);
	    widths.push({dist:Math.abs(index - nextIndex), 
			 x1: index%width, 
			 x2: nextIndex%width, 
			 y1: y, 
			 y2: y});
	}
    }

    for(var i = 0; i < indices.length - 1; i++)
    {
	var index = indices[i]/4;
	var nextIndex = index;

	for(var oi = i+1; oi < i + width && oi < indices.length; oi++)
	{
	    var pin = indices[oi]/4;
	    if((pin % width) == (index % width))
	    {
		nextIndex = pin;
		break
	    }
	}

	if(nextIndex != index)
	{
	    var x = index % width;
	    var y1 = Math.floor(index/width);
	    var y2 = Math.floor(nextIndex / width);
	    heights.push({dist:Math.abs(y1 - y2), 
		          x1: x,
			  x2: x, 
			  y1: y1,
			  y2: y2});
	}
    }

    var boxMatch = [];

    for(var wi = 0; wi < widths.length; wi++)
    {
	for(var hi = 0; hi < heights.length; hi++)
	{
	    if((heights[hi].x1 >= widths[wi].x1) 
	       && (heights[hi].x1 <= widths[wi].x2)
	       && (widths[wi].y1 >= heights[hi].y1)
	       && (widths[wi].y1 <= heights[hi].y2))
	    {
		var ratio = heights[hi].dist / widths[wi].dist;

		/*if(Math.abs(ratio - heightRatio) < epsilon)
		{*/
		    boxMatch.push({x1: widths[wi].x1,
				   x2: widths[wi].x2,
				   y1: heights[hi].y1,
				   y2: heights[hi].y2});
		//}
	    }
	}
    }

    console.log(boxMatch);

    return boxMatch;
}