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
    this.mergeHorizontalLines();
    this.mergeVerticalLines();
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

BoxFinder.prototype.mergeHorizontalLines = function()
{
    var hasMerged = true;
    while(hasMerged)
    {
	for(var lineIndex1 = 0; lineIndex1 < this.horizontalLines.length-1; lineIndex1++)
	{
	    var currentLine = this.horizontalLines[lineIndex1];

	    for(var lineIndex2 = lineIndex1+1; lineIndex2 < this.horizontalLines.length; lineIndex2++)
	    {		
		var nextLine = this.horizontalLines[lineIndex2];

		hasMerged = this.canMergeHorizontal(currentLine, nextLine);

		if(hasMerged)
		{
		    if(currentLine.x2 < nextLine.x2)
		    {
			currentLine.x2 = nextLine.x2;
		    }
		    
		    if(currentLine.x1 > nextLine.x1)
		    {
			currentLine.x1 = nextLine.x1;
		    }

		    if(nextLine.y1 > nextLine.y2) // going down
		    {
			if(currentLine.y2 < nextLine.y2)
			{
			    currentLine.y2 = nextLine.y2;
			}
			
			if(currentLine.y1 > nextLine.y1)
			{
			    currentLine.y1 = nextLine.y1;
			}
 		    }
		    else
		    {
			if(currentLine.y2 > nextLine.y2)
			{
			    currentLine.y2 = nextLine.y2;
			}
			
			if(currentLine.y1 < nextLine.y1)
			{
			    currentLine.y1 = nextLine.y1;
			}
		    }
		    
		    this.horizontalLines.splice(lineIndex2, 1);

		    break;
		}
	    }

	    if(hasMerged)
	    {		
		break;
	    }
	}
    }
}

BoxFinder.prototype.canMergeHorizontal = function(currentLine, nextLine)
{
    if((Math.abs(currentLine.y2 - nextLine.y2) <= 4)&&(Math.abs(currentLine.y1 - nextLine.y1) <= 4))
    {
	if((currentLine.x2 >= nextLine.x2) && (currentLine.x1 <= nextLine.x1))
	{
	    return true;
	}

	if((currentLine.x2 <= nextLine.x2) && (currentLine.x1 >= nextLine.x1))
	{
	    return true;
	}

	if((currentLine.x2 < nextLine.x2) && ((Math.abs(currentLine.x2 - nextLine.x1) <= 4) || (currentLine.x2 > nextLine.x1)))
	{
	    return true;
	}

	if(((Math.abs(currentLine.x1 - nextLine.x2) <= 4) || (currentLine.x1 <= nextLine.x2)) && (currentLine.x2 > nextLine.x2))
	{
	    return true;
	}
    }
    return false;
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

BoxFinder.prototype.mergeVerticalLines = function()
{
    var mergeables = [];
    var mergedIndices = [];
    var newLines = [];
    var hasMerged = true;

    while(this.verticalLines.length > 0)
    {
	if(mergeables.length > 0)
	{
	    for(var ii = mergedIndices.length; ii >= 0; ii--)
	    {
		this.verticalLines.splice(mergedIndices[ii], 1);
	    }
	    newLines.push(this.createMergedVerticalLine(mergeables));
	    mergeables = [];
	    mergedIndices = [];
	}

	if(this.verticalLines.length == 0)
	{
	    break;
	}

	mergeables.push(this.verticalLines.splice(0, 1)[0]);

	for(var lineIndex = 0; lineIndex < this.verticalLines.length; lineIndex++)
	{
	    var nextLine = this.verticalLines[lineIndex];

	    for(var mergeIndex = 0; mergeIndex < mergeables.length; mergeIndex++)
	    {
		var merger = mergeables[mergeIndex];
		hasMerged = this.canMergeVertical(merger, nextLine);
		if(hasMerged)
		{
		    break;
		}
	    }

	    if(hasMerged)
	    {
		mergeables.push(nextLine);
		mergedIndices.push(lineIndex);
	    }
	}
    }

    if(mergeables.length > 0)
    {
	newLines.push(this.createMergedVerticalLine(mergeables));
    }

    this.verticalLines = newLines;
}

BoxFinder.prototype.canMergeVertical = function(currentLine, nextLine)
{
    if(!nextLine || !currentLine)
    {
	return false;
    } 

    if((Math.abs(currentLine.x2 - nextLine.x2) <= 4)&&(Math.abs(currentLine.x1 - nextLine.x1) <= 4))
    {
	if((currentLine.y2 >= nextLine.y2) && (currentLine.y1 <= nextLine.y1))
	{
	    return true;
	}

	if((currentLine.y2 <= nextLine.y2) && (currentLine.y1 >= nextLine.y1))
	{
	    return true;
	}

	if(((nextLine.y1 - currentLine.y2) <= 4) && (currentLine.y2 < nextLine.y1))
	{
	    return true;
	}

	if(((currentLine.y1 - nextLine.y2) <= 4) && (nextLine.y2 < currentLine.y1))
	{
	    return true;
	}
    }
    
    return false;
}

BoxFinder.prototype.createMergedVerticalLine = function(mergeables)
{
    console.log(mergeables.length);
    var newLine = {x1: mergeables[0].x1, 
		   x2: mergeables[0].x2,
		   y1: mergeables[0].y1,
		   y2: mergeables[0].y2};

    for(var mergeIndex = 1; mergeIndex < mergeables.length; mergeIndex++)
    {
	var line = mergeables[mergeIndex];

	if(line.y1 < newLine.y1)
	{
	    newLine.y1 = line.y1;
	    newLine.x1 = line.x1;
	}

	if(line.y2 > newLine.y2)
	{
	    newLine.y2 = line.y2;
	    newLine.x2 = line.x2;
	}
    }

    return newLine;
}