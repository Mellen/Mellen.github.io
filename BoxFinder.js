function BoxFinder(edgeBins, width, height, ratio)
{
    this.edgeBins = edgeBins;
    this.width = width;
    this.height = height;
    this.centralBoxRatio = ratio
}

BoxFinder.prototype.findBoxes = function()
{
    this.boxes = [];
    this.findHorizontalLines();
    this.findVerticalLines();
    this.mergeHorizontalLines();
    this.mergeVerticalLines();
    this.makeBoxes();
    this.selectCentralBox();
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
	    for(var ii = mergedIndices.length - 1; ii >= 0; ii--)
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

	mergeables.push(this.verticalLines[0]);
	mergedIndices.push(0);

	for(var lineIndex = 1; lineIndex < this.verticalLines.length; lineIndex++)
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

    if((Math.abs(currentLine.x2 - nextLine.x2) <= 4)||(Math.abs(currentLine.x1 - nextLine.x1) <= 4)||(Math.abs(currentLine.x2 - nextLine.x1) <= 4)||(Math.abs(currentLine.x1 - nextLine.x2) <= 4))
    {
	if(nextLine.y1 >= currentLine.y1 && nextLine.y2 <= currentLine.y2)
	{
	    return true;
	}

	if(nextLine.y1 >= currentLine.y1 && nextLine.y2 >= currentLine.y2 && nextLine.y1 <= currentLine.y2)
	{
	    return true;
	}

	if(nextLine.y1 <= currentLine.y1 && nextLine.y2 <= currentLine.y2 && nextLine.y2 >= currentLine.y1)
	{
	    return true;
	} 

	if(nextLine.y1 < currentLine.y1 && nextLine.y2 > currentLine.y2)
	{
	    return true;
	}

	if(nextLine.y1 <= currentLine.y1 && nextLine.y2 <= currentLine.y1 && (currentLine.y1 - nextLine.y2) <= 4)
	{
	    return true;
	}

	if(nextLine.y1 >= currentLine.y2 && nextLine.y2 >= currentLine.y2 && (nextLine.y1 - currentLine.y2) <= 4)
	{
	    return true;
	}
    }
    
    return false;
}

BoxFinder.prototype.createMergedVerticalLine = function(mergeables)
{
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

BoxFinder.prototype.makeBoxes = function()
{
    //dictionary of co-ordinates
    var cornersH = {};
    for(var hlindex in this.horizontalLines)
    {
	var hline = this.horizontalLines[hlindex];
	
	for(var distx = -2; distx < 3; distx++)
	{
	    for(var disty = -2; disty < 3; disty++)
	    {
		var x1 = hline.x1 + distx;
		var y1 = hline.y1 + disty;
		if(x1 >= 0 && y1 >= 0)
		{
		    var c1 = x1 + ',' + y1;
		    if(typeof cornersH[c1] === 'undefined')
		    {
			cornersH[c1] = [hline];
		    }
		    else
		    {
			cornersH[c1].push(hline);
		    }
		}

		var x2 = hline.x2 + distx;
		var y2 = hline.y2 + disty;
		if(x2 >= 0 && y2 >= 0)
		{
		    var c2 = x2 + ',' + y2;
		    if(typeof cornersH[c2] === 'undefined')
		    {
			cornersH[c2] = [hline];
		    }
		    else
		    {
			cornersH[c2].push(hline);
		    }
		}
	    }
	}	
    }

    var cornersV = {};
    for(var vlindex in this.verticalLines)
    {
	var vline = this.verticalLines[vlindex];
	
	for(var distx = -2; distx < 3; distx++)
	{
	    for(var disty = -2; disty < 3; disty++)
	    {
		var x1 = vline.x1 + distx;
		var y1 = vline.y1 + disty;
		if(x1 >= 0 && y1 >= 0)
		{
		    var c1 = x1 + ',' + y1;
		    if(typeof cornersV[c1] === 'undefined')
		    {
			cornersV[c1] = [vline];
		    }
		    else
		    {
			cornersV[c1].push(vline);
		    }
		}

		var x2 = vline.x2 + distx;
		var y2 = vline.y2 + disty;
		if(x2 >= 0 && y2 >= 0)
		{
		    var c2 = x2 + ',' + y2;
		    if(typeof cornersV[c2] === 'undefined')
		    {
			cornersV[c2] = [vline];
		    }
		    else
		    {
			cornersV[c2].push(vline);
		    }
		}
	    }
	}	
    }

    this.boxes = [];

    for(var hcoord1 in cornersH)
    {
	var box = {x1:0, x2:0, x3:0, x4:0, y1:0, y2:0, y3:0, y4:0};

	var hlinelist1 = cornersH[hcoord1];

	var vlinelist1 = cornersV[hcoord1];
	if(typeof vlinelist1 === 'undefined')
	{
	    continue;
	}

	for(var vlindex in vlinelist1)
	{    
	    var vcoord1 = vlinelist1[vlindex].x2 + ',' + vlinelist1[vlindex].y2;

	    if(this.areCloseEnough(hcoord1, vcoord1))
	    {
		vcoord1 = vlinelist1[vlindex].x1 + ',' + vlinelist1[vlindex].y1;
	    }

	    var hlinelist2 = cornersH[vcoord1];

	    if(typeof hlinelist2 === 'undefined')
	    {
		continue;
	    }
	    
	    for(var hlindex1 in hlinelist2)
	    {
		var hcoord2 = hlinelist2[hlindex1].x2 + ',' + hlinelist2[hlindex1].y2;
		
		if(this.areCloseEnough(hcoord2, vcoord1))
		{
		    hcoord2 = hlinelist2[hlindex1].x1 + ',' + hlinelist2[hlindex1].y1;
		}

		var vlinelist2 = cornersV[hcoord2];

		if(typeof vlinelist2 === 'undefined')
		{
		    continue;
		}
		

		var boxdupecheck = {};

		for(var vlindex2 in vlinelist2)
		{
		    var vcoord2 = vlinelist2[vlindex2].x1 + ',' + vlinelist2[vlindex2].y1;
		    if(this.areCloseEnough(hcoord2, vcoord2))
		    {
			vcoord2 = vlinelist2[vlindex2].x2 + ',' + vlinelist2[vlindex2].y2;
		    }

		    for(var hlindex2 in hlinelist1)
		    {
			var hcoord3 = hlinelist1[hlindex2].x1 + ',' + hlinelist1[hlindex2].y1;

			if(this.areCloseEnough(hcoord3, hcoord1))
			{
			    hcoord3 = hlinelist1[hlindex2].x2 + ',' + hlinelist1[hlindex2].y2;
			}

			if(this.areCloseEnough(hcoord3, vcoord2))
			{
			    var box = this.makeBoxFromParts(hcoord1, hcoord2, vcoord1, vcoord2);

			    var boxstring = box.x + ',' + box.y + ',' + box.width + ',' + box.height;

			    if(typeof boxdupecheck[boxstring] === 'undefined')
			    {
				boxdupecheck[boxstring] = 1;

				this.boxes.push(box);
			    }
			}
		    }
		}
	    }
	}
    }
}

BoxFinder.prototype.makeBoxFromParts = function(hcoord1, hcoord2, vcoord1, vcoord2)
{
    var hc1 = hcoord1.split(',');
    var vc1 = vcoord1.split(',');
    var hc2 = hcoord2.split(',');
    var vc2 = vcoord2.split(',');

    var left = Math.min.apply(null, [hc1[0], vc1[0], hc2[0], vc2[0]]);
    var top = Math.min.apply(null, [hc1[1], vc1[1], hc2[1], vc2[1]]);
    var right = Math.max.apply(null, [hc1[0], vc1[0], hc2[0], vc2[0]]);
    var bottom = Math.max.apply(null, [hc1[1], vc1[1], hc2[1], vc2[1]]);

    return {x:left, y:top, width: (right - left), height: (bottom - top)};
}

//tests if the coordinates are close enough to be the same
BoxFinder.prototype.areCloseEnough = function(coord1, coord2)
{
    var c1 = coord1.split(',');
    var c2 = coord2.split(',');

    var p1 = {x:parseInt(c1[0], 10), y:parseInt(c1[1], 10)};
    var p2 = {x:parseInt(c2[0], 10), y:parseInt(c2[1], 10)};

    return (Math.abs(p1.x - p2.x) <= 2) && (Math.abs(p1.y - p2.y) <=2); 
}

BoxFinder.prototype.selectCentralBox = function()
{
    var closeEnoughBoxes = [];

    for(var bi in this.boxes)
    {
	var ratio = this.boxes[bi].height / this.boxes[bi].width;
	if(Math.abs(this.ratio - ratio) < 0.009)
	{
	    closeEnoughBoxes.push(this.boxes[bi]);
	}
    }

    if(closeEnoughBoxes.length == 0)
    {
	this.centralBox = this.boxes[0];
    }
    else
    {
	this.centralBox = closeEnoughBoxes[0];
	for(var cbi in closeEnoughBoxes)
	{
	    if(closeEnoughBoxes[cbi].height > this.centralBox.height)
	    {
		this.centralBox = closeEnoughBoxes[cbi];
	    }
	}
    }
}