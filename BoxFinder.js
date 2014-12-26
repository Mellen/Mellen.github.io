function BoxFinder(edgeBins, width, height)
{
    this.edgeBins = edgeBins;
    this.width = width;
    this.height = height;
}

BoxFinder.prototype.findBoxes = function()
{
    this.boxes = [];
    this.findHorizontalLines();
}

BoxFinder.prototype.findHorizontalLines = function()
{
    this.horizontalLines = [];
    for(var rowIndex in this.edgeBins)
    {
	if(this.edgeBins[rowIndex].length === 0)
	{
	    continue;
	}

	var row = this.edgeBins[rowIndex];
	var result = this.findLineStart(row, 0);

	var point = result.p;
	var firstPointBinIndex = result.bi;

	if(point === -1)
	{
	    continue;
	}

	var line = {x1:point.x, x2:point.x,
		    y1:point.y, y2:point.y};

	for(var binIndex = firstPointBinIndex+1; binIndex < row.length; binIndex++)
	{
	    point = this.findNextLinePoint(row[binIndex]);
	    if(point === -1)
	    {
		this.horizontalLines.push(line);
		line = null;
		result = this.findLineStart(row, binIndex);
		if(result.p == -1)
		{
		    break;
		}
		else
		{
		    binIndex = result.bi;
		    line = {x1:result.p.x, x2:result.p.x,
			    y1:result.p.y, y2:result.p.y};
		}
	    }
	    else
	    {
		line.x2 = point.x;
		line.y2 = point.y;
	    }
	}

	if(line !== null)
	{
	    this.horizontalLines.push(line);
	}
    }
}

BoxFinder.prototype.findLineStart = function(row, binIndexStart)
{
    var found = false;

    for(var binIndex = binIndexStart; binIndex < row.length; binIndex++)
    {
	if(row[binIndex].length > 0)
	{
	    found = true;
	    break;
	}
    }

    if(!found)
    {
	return {p:-1, bi:-1};
    }

    var bin = row[binIndex];

    var point = bin[0];

    for(var pointIndex in bin)
    {
	if(bin[pointIndex].x < point.x)
	{
	    point = bin[pointIndex];
	}
	else if (bin[pointIndex].x === point.x && bin[pointIndex].y < point.y)
	{
	    point = bin[pointIndex];
	}
    }

    return {p:point, bi:binIndex};
}

BoxFinder.prototype.findNextLinePoint = function(bin)
{
    if(bin.length === 0)
    {
	return -1;
    }
    var point = bin[0];

    for(var pointIndex in bin)
    {
	if(bin[pointIndex].x > point.x)
	{
	    point = bin[pointIndex];
	}
    }

    return point;
    
}