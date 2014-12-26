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
    this.findVerticalLines();
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
	var result = this.findHorizontalLineStart(row, 0);

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
	    point = this.findNextHorizontalLinePoint(row[binIndex]);
	    if(point === -1)
	    {
		if(line.x2 - line.x1 > 4)
		{
		    this.horizontalLines.push(line);
		}
		line = null;
		result = this.findHorizontalLineStart(row, binIndex);
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

	if(line !== null &&  (line.x2 - line.x1 > 4))
	{
	    this.horizontalLines.push(line);
	}
    }
}

BoxFinder.prototype.findHorizontalLineStart = function(row, binIndexStart)
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

BoxFinder.prototype.findNextHorizontalLinePoint = function(bin)
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

BoxFinder.prototype.findVerticalLines = function()
{
    this.verticalLines = [];
    for(var columnIndex = 0; columnIndex < this.edgeBins[0].length; columnIndex++)
    {
	var result = this.findVerticalLineStart(columnIndex, 0);
	if(result.p === -1)
	{
	    continue;
	}

	var line = {x1: result.p.x, x2: result.p.x,
		    y1: result.p.y, y2: result.p.y};
 
	for(var rowIndex = result.ri+1; rowIndex < this.edgeBins.length; rowIndex++)
	{
	    point = this.findNextVerticalLinePoint(columnIndex, rowIndex);
	    if(point === -1)
	    {
		if(line.y2 - line.y1 > 4)
		{
		    this.verticalLines.push(line);
		}

		result = this.findVerticalLineStart(columnIndex, rowIndex);
		if(result.p === -1)
		{
		    line = null;
		    break;
		}
		else
		{
		    rowIndex = result.ri;
		    line = {x1: result.p.x, x2: result.p.x,
			    y1: result.p.y, y2: result.p.y};
		}
	    }
	    else
	    {
		line.x2 = point.x;
		line.y2 = point.y;
	    }
	}	

	if(line !== null && line.y2 - line.y1 > 4)
	{
	    this.verticalLines.push(line);
	}
    }
}

BoxFinder.prototype.findVerticalLineStart = function(columnIndex, startRowIndex)
{
    found = false;
    for(var rowIndex = startRowIndex; rowIndex < this.edgeBins.length; rowIndex++)
    {
	if(this.edgeBins[rowIndex][columnIndex].length > 0)
	{
	    found = true;
	    break;
	}
    }

    if(!found)
    {
	return{p:-1, ri:-1};
    }

    var point = this.edgeBins[rowIndex][columnIndex][0];
    var bin = this.edgeBins[rowIndex][columnIndex];

    for(var pointIndex in bin)
    {
	if(bin[pointIndex].y < point.y)
	{
	    point = bin[pointIndex];
	}
	else if((bin[pointIndex].y == point.y) && (bin[pointIndex].x < point.x))
	{
	    point = bin[pointIndex];
	}
    }

    return {p:point, ri:rowIndex};
}

BoxFinder.prototype.findNextVerticalLinePoint = function(columnIndex, rowIndex)
{
    if(this.edgeBins[rowIndex][columnIndex].length === 0)
    {
	return -1;
    }

    var point = this.edgeBins[rowIndex][columnIndex][0];
    var bin = this.edgeBins[rowIndex][columnIndex];

    for(var pointIndex in bin)
    {
	if(bin[pointIndex].y < point.y)
	{
	    point = bin[pointIndex];
	}
	else if((bin[pointIndex].y == point.y) && (bin[pointIndex].x < point.x))
	{
	    point = bin[pointIndex];
	}
    }

    return point;
}