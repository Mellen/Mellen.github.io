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
    var horizontalPosition = 0;
    var verticalPosition = 0;

    for(var pixelIndex = 0; pixelIndex < this.edges.length; pixelIndex += 4)
    {
	var x = (pixelIndex / 4) % (width / 4);
	var y = (pixelIndex / 4) / (width / 4);

	if(this.bins[x] === undefined)
	{
	    this.bins.push([]);
	}

	var value = this.edges.data[i];

	if(this.bins[x][y] === undefined)
	{
	    this.bins[x].push(value);
	}
	else
	{
	    if(this.bins[x][y] === 0)
	    {
		this.bins[x][y] = value;
	    }
	}
	
    }

}
