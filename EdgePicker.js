function EdgePicker(edges, colourField, limit)
{
    this.stdDev = 0;
    this.edges = edges;
    this.colourField = colourField;
    this.limit = limit;
}

EdgePicker.prototype.calcStdDev = function()
{
    this.stdDev = 0;
    var pixelCount = this.colourField.width * this.colourField.height;
    var colourScore = 0;
    for(var pi = 0; pi < this.colourField.data.length; pi += 4)
    {
	colourScore += this.colourField.data[pi];
    }
    var mean = colourScore / pixelCount;
    var distsFromMeanSquared = [];

    for(var pi = 0; pi < this.colourField.data.length; pi+=4)
    {	
	var redVal = this.colourField.data[pi];
	distsFromMeanSquared.push((redVal - mean) * (redVal - mean));
    }

    this.stdDev = Math.sqrt(distsFromMeanSquared.reduce(function(a,b){return a+b;}) / distsFromMeanSquared.length);
}

EdgePicker.prototype.calcEdges = function()
{
    this.calcStdDev();

    for(var pi = 0; pi < this.edges.data.length; pi+=4)
    {
	if(pi % (this.colourField.width*4) != (this.colourField.width * 4))
	{
	    var redVal1 = this.colourField.data[pi];

	    var redVal2 = this.colourField.data[pi+4];

	    var scale = Math.abs(redVal1 - redVal2) / this.stdDev;
	    if(scale > this.limit)
	    {
		this.edges.data[pi] = 255;
		this.edges.data[pi+1] = 255;
		this.edges.data[pi+2] = 255;
	    }
	}
	this.edges.data[pi+3] = 255;
    }

    var width = this.edges.width * 4;

    for(var pi = 0; pi < this.edges.data.length; pi+=4)
    {
	if(pi < (this.edges.data.length - (width)))
	{
	    var redVal1 = this.colourField.data[pi];

	    var redVal2 = this.colourField.data[pi+width];

	    var scale = Math.abs(redVal1 - redVal2) / this.stdDev;
	    if(scale > this.limit)
	    {
		this.edges.data[pi] = 255;
		this.edges.data[pi+1] = 255;
		this.edges.data[pi+2] = 255;
	    }
	}
	this.edges.data[pi+3] = 255;
    }	
}

EdgePicker.prototype.calcEdgeBins = function()
{
// floor(index / width) = y
// index % width = x

    this.calcEdges();

    this.bins = [];

    var width = this.edges.width * 4;
    var bin = [];

    for(var pixelIndex = 0; pixelIndex < this.edges.data.length; pixelIndex += 4)
    {
	var x = Math.floor(pixelIndex / 4) % (width / 4);
	var y = Math.floor((pixelIndex / 4) / (width / 4));

	var column = Math.floor(pixelIndex / 16) % (width / 16);
	var row  = Math.floor((pixelIndex / 16) / (width / 16));

	if(this.bins[row] === undefined)
	{
	    this.bins.push([]);
	}

	if(this.bins[row][column] === undefined)
	{
	    this.bins[row].push([]);
	}

	if(this.edges.data[pixelIndex] !== 0)
	{
	    this.bins[row][column].push({x:x, y:y});
	}	
    }

}
