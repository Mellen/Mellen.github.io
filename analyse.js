var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var canEdge = document.getElementById('edges');
var ctxEdge = canEdge.getContext('2d');

//var vid = document.getElementById('vid');
var img = document.getElementById('strip');
var dropPercent = document.getElementById('dp');
var level = document.getElementById('level');
var localMediaStream = null;

//arbitrary values from one particular image used to produce ratios
var patchHeightToWidthRatio = 71/55;

//vid.addEventListener('click', capture, false);
img.addEventListener('click', process, false);

/*navigator.getUserMedia = ( navigator.getUserMedia ||
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
	edgeIndices = getEdgeMap(edges);
	var bounds = calculateBounds(edgeIndices, canvas.width, canvas.height);
	ctx.strokeStyle = '#ff0000';
	for(var bi = 0; bi < bounds.length; bi++)
	{
	    ctx.strokeRect(bounds[bi].x1, bounds[bi].y1, bounds[bi].x2 - bounds[bi].x1, bounds[bi].y2 - bounds[bi].y1);
	}
	ctxEdge.putImageData(edges, 0, 0);

	var ratios = calculateRatios(pixels);
	dropPercent.innerHTML = ratios.normalised_drop_percent;
	level.innerHTML = ratios.level;
    }
}*/

function process()
{

    canvas.width = this.clientWidth;
    canvas.height = this.clientHeight;
    canEdge.width = this.clientWidth;
    canEdge.height = this.clientHeight;
    ctx.drawImage(this, 0, 0);
    var pixels = ctx.getImageData(0,0, canvas.width, canvas.height);
    var edges = ctxEdge.createImageData(canEdge.width, canEdge.height);
    setEdges(edges, pixels);
    console.log('beep');
    edgeBins = getEdgeBins(edges);
    console.log('boop');
    var bounds = calculateBounds(edgeBins, canvas.width, canvas.height);
    ctx.strokeStyle = '#ff0000';
    for(var bi = 0; bi < bounds.length; bi++)
    {
	ctx.strokeRect(bounds[bi].x1, bounds[bi].y1, bounds[bi].x2 - bounds[bi].x1, bounds[bi].y2 - bounds[bi].y1);
    }
    ctxEdge.putImageData(edges, 0, 0);

    var ratios = calculateRatios(pixels);
    dropPercent.innerHTML = ratios.normalised_drop_percent;
    level.innerHTML = ratios.level;
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

    var limit = 0.25;

    for(var pi = 0; pi < edges.data.length; pi+=4)
    {
	if(pi % (colourField.width*4) != (colourField.width * 4))
	{
	    var redVal1 = colourField.data[pi];

	    var redVal2 = colourField.data[pi+4];

	    var scale = Math.abs(redVal1 - redVal2) / stdDev;
	    if(scale > limit)
	    {
		edges.data[pi] = 255;
		edges.data[pi+1] = 255;
		edges.data[pi+2] = 255;
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
		edges.data[pi] = 255;
		edges.data[pi+1] = 255;
		edges.data[pi+2] = 255;
	    }
	}
	edges.data[pi+3] = 255;
    }	
}

function getEdgeBins(edges)
{
// floor(index / width) = y
// index % width = x

    var bins = [];

    var width = edges.width * 4;

    for(var pi = 0; pi < edges.data.length - (width * 3); pi += 4)
    {
	var bin = [];

	if(edges.data[pi] == 255 || edges.data[pi + width] == 255 || edges.data[pi + (width*2) || edges.data[pi + (width*3)] == 225)
	{	    
	    if(edges.data[pi] == 255)
	    {
		var x = ((pi/4) % width)/4;
		var y = Math.floor((pi/4)/width)/4;
		bin.push({x:x, y:y});
	    }
	    if(edges.data[pi + width] == 255)
	    {
		var x = ((pi+ width) % width)/4;
		var y = Math.floor((pi + width)/width)/4;
		bin.push({x:x, y:y});
	    }
	    if(edges.data[pi + (width*2)] == 255)
	    {
		var x = (pi+ (width*2)) % width)/4;
		var y = Math.floor((pi + (width*2))/width)/4;
		bin.push({x:x, y:y});
	    }
	    if(edges.data[pi + (width*3)] == 255)
	    {
		var x = ((pi+ (width*3)) % width)/4;
		var y = Math.floor((pi + (width*3))/width)/4;
		bin.push({x:x, y:y});
	    }
	}

	bins.push(bin);

	if(pi % width == (width - 1))
	{
	    pi += (width * 3);
	}
    }

    return bins;
}

function calculateBounds(edgeBins, width, height)
{
    var epsilon = 0.01;

    var boxMatch = [];

    var hls = [];

    for(var ebi = 0; ebi < edgeBins.length; ebi++)
    {
	var hli = Math.floor(ebi/width);

	if(ebi % width == 0)
	{
	    hls.push([]);
	}

	if(edgeBins[ebi].length != 0)
	{
	    if(!hls[hli][hls[hli].length - 1].start || hls[hli][hls[hli].length - 1].finish)
	    {
		hls[hli].push({start:{x:ebi%width, y:hli}});
	    }
	}
	else
	{
	    if(hls[hli].length > 0 && !hls[hli][hls[hli].length - 1].finish && hls[hli][hls[hli].length - 1].start)
	    {
		hls[hli][hls[hli].length - 1].finish = {x:ebi%width, y:hli};
		
	    }
	}
    }

    var vls = [];

    return boxMatch;
}
