var btn = document.getElementById('btnMultiply');
btn.addEventListener("click", startmultiply, false);
speed = 500;

if(''.contains == undefined)
{
    String.prototype.contains = function(other)
    {
	if(other.length > this.length)
	    return false;

	return this.indexOf(other) != -1;
    }
}

function startmultiply()
{
    var table = document.getElementById('sum');

    while(table.rows.length > 0)
    {
	table.deleteRow(0);
    }

    var n1 = document.getElementById('txtno1').value;
    var n2 = document.getElementById('txtno2').value;

    var dp1 = 0;
    var dp2 = 0;

    if(n1.contains('.'))
    {
	var small = n1.split('.')[1];
	dp1 = small.length;
    }

    if(n2.contains('.'))
    {
	var small = n2.split('.')[1];
	dp2 = small.length;
    }

    var totaldp = dp1 + dp2;

    if(dp1 > dp2)
    {
	totaldp = dp1*2;
	var extraZero = '0'.repeat(dp1 - dp2)
	if(!n2.contains('.'))
	{
	    n2 += '.';
	}
	n2 += extraZero
    }
    else if(dp2 > dp1)
    {
	totaldp = dp2*2;
	var extraZero = '0'.repeat(dp2 - dp1)
	if(!n1.contains('.'))
	{
	    n1 += '.';
	}
	n1 += extraZero
    }

    var negative = (n1.indexOf('-') == 0 && n2.indexOf('-') != 0) || (n2.indexOf('-') == 0 && n1.indexOf('-') != 0)

    firstnumbers = n1.split('').reverse();
    secondnumbers = n2.split('').reverse();

    var width = firstnumbers.length + secondnumbers.length
    if(n1.contains('.') || n2.contains('.'))
    {
	width--;
    }
    if(n1.contains('-') && n2.contains('-'))
    {
	width -= 2;
    }

    placeDigits(table, firstnumbers, width);
    placeDigits(table, secondnumbers, width);

    firstnumbers = firstnumbers.filter(function(n){ return n != '-'; });
    secondnumbers = secondnumbers.filter(function(n){ return n != '-'; });

    var c = table.rows[1].cells[0];
    c.innerHTML = '&times;';

    var empty = table.insertRow(-1);
    for(var e = 0; e < width; e++)
    {
	var c = empty.insertCell(-1);
	c.innerHTML = '&#151;';
    }

    startAnimation(table, firstnumbers, secondnumbers, width, negative, totaldp);
}

function startAnimation(table, firstnumbers, secondnumbers, width, negative, totaldp)
{
    createEmptyRow(table, width);
    multiplicationStep(table, table.rows.length - 1, firstnumbers, secondnumbers, [], [], 0, 0, width - 1, width, negative, totaldp);
}

function createEmptyRow(table, width)
{
    var row = table.insertRow(-1);

    for(var r = 0; r < width; r++)
    {
	var c = row.insertCell(-1);
	c.innerHTML = '&nbsp;';
    }
}

function multiplicationStep(table, rowIndex, firstnumbers, secondnumbers, allParts, part, fnIndex, snIndex, position, width, negative, totaldp)
{
    if(secondnumbers[snIndex] != '.')
    {
	hilightNumbers(table, width, fnIndex, snIndex);
	
	var partResult = document.getElementById('partResult');
	
	var pr = firstnumbers[fnIndex] * secondnumbers[snIndex];
	
	partResult.innerHTML = pr;
	
	partResult.style.top = (table.offsetTop + table.rows[rowIndex].offsetTop + 1) + 'px';
	partResult.style.left = (table.offsetLeft + table.rows[rowIndex].offsetLeft + table.rows[rowIndex].offsetWidth + 5) + 'px';

	var expectedLength = 0;

	if(part.length == 0)
	{
	    if((firstnumbers.indexOf('.') > -1) && (firstnumbers.indexOf('.') < fnIndex))
	    {
		part.unshift(pr * Math.pow(10, fnIndex-1));
	    }
	    else
	    {
		part.unshift(pr * Math.pow(10, fnIndex));
	    }

	    expectedLength = Math.floor(Math.log10(part[0])) + 1;
	}
	else
	{
	    part[0] += pr;

	    expectedLength = part.length;
	}
	position = splitResultIntoDigits(part, table, rowIndex, position, width, totaldp, true, expectedLength);
    }
    
    snIndex++;

    if(secondnumbers[snIndex] == '.')
    {
	snIndex++;
    }

    if(snIndex < secondnumbers.length)
    {
	setTimeout(multiplicationStep, speed, table, rowIndex, firstnumbers, secondnumbers, allParts, part, fnIndex, snIndex, position, width, negative, totaldp);
    }
    else if(fnIndex < (firstnumbers.length - 1))
    {
	if(part.length <= totaldp)
	{
	    while(part.length < totaldp)
	    {
		part.unshift(0);
		if(part.length >= (width - position))
		{
		    table.rows[rowIndex].cells[position].innerHTML = '0';
		    position--;
		}		
	    }
	    part.unshift(0);
	    table.rows[rowIndex].cells[position].innerHTML = '.';
	    table.rows[rowIndex].cells[position-1].innerHTML = '0';

	    position -= 2;
	}
	else
	{
	    position--;
	}

	if(negative)
	{
	    table.rows[rowIndex].cells[position].innerHTML = '-';
	}

	position = width - 1;
	snIndex = 0;
	fnIndex++;
	if(firstnumbers[fnIndex] =='.')
	{
	    fnIndex++;
	}
	createEmptyRow(table, width)
	rowIndex++;
	allParts.push(part);
	setTimeout(multiplicationStep, speed, table, rowIndex, firstnumbers, secondnumbers, allParts, [], fnIndex, snIndex, position, width, negative, totaldp);
    }
    else
    {
	if(part.length <= totaldp)
	{
	    while(part.length < totaldp)
	    {
		part.unshift(0);
		if(part.length >= (width - position))
		{
		    table.rows[rowIndex].cells[position].innerHTML = '0';
		    position--;
		}		
	    }
	    part.unshift(0);
	    table.rows[rowIndex].cells[position].innerHTML = '.';
	    table.rows[rowIndex].cells[position-1].innerHTML = '0';
	    position -= 2;
	}
	else
	{
	    position--;
	}

	if(negative)
	{
	    table.rows[rowIndex].cells[position].innerHTML = '-';
	}
	
	partResult.innerHTML = '';
	clearAllClasses(table);
	allParts.push(part);
	startAddition(table, width, allParts, negative, totaldp);
    }
}

function splitResultIntoDigits(part, table, rowIndex, position, width, totaldp, firstCycle, expectedLength)
{
    if((width - position == (totaldp+1))&&(totaldp > 0))
    {
	table.rows[rowIndex].cells[position].innerHTML = '.';
	position--;
	expectedLength++;
	position = splitResultIntoDigits(part, table, rowIndex, position, width, totaldp, false, expectedLength);
    }
    else if(part[0] < 10)
    {
	table.rows[rowIndex].cells[position].innerHTML = part[0];
	if(firstCycle)
	{
	    position--;
	}

	if(part.length == expectedLength)
	{
	    part.unshift(0);
	}
    }
    else
    {
	var unit = part[0] % 10;
	var rem = Math.floor(part[0] / 10);
	
	part[0] = unit;
	table.rows[rowIndex].cells[position].innerHTML = part[0];
	position--;

	part.unshift(rem);

	position = splitResultIntoDigits(part, table, rowIndex, position, width, totaldp, false, expectedLength);
    }

    return position;
}

function clearAllClasses(table)
{
    for(var r = 0; r < table.rows.length; r++)
    {
	for(var c = 0; c < table.rows[r].cells.length; c++)
	{
	    table.rows[r].cells[c].className = '';
	}
    }
}

function hilightNumbers(table, width, fnIndex, snIndex)
{
    clearAllClasses(table);
    table.rows[0].cells[width - (fnIndex+1)].className = 'fnsel';
    table.rows[1].cells[width - (snIndex+1)].className = 'snsel';
}

function startAddition(table, width, allParts, negative, totaldp)
{
    var empty = table.insertRow(-1);
    for(var e = 0; e < width; e++)
    {
	var c = empty.insertCell(-1);
	c.innerHTML = '&#151;';
    }

    var sums = [];
    var rem = 0;
    for(var pi = 0; pi < allParts[allParts.length - 1].length; pi++)
    {
	var sum = 0;
	var skippush = true;
	for(var partindex in allParts)
	{
	    if(allParts[partindex].length > pi && allParts[partindex][pi] != '.' && allParts[partindex][pi] != '-')
	    {
		sum += allParts[partindex][pi];
		skippush = false;
	    }
	}
	
	if(!skippush)
	{
	    sum += rem;
	    var val = sum % 10;
	    rem = Math.floor(sum / 10);
	    sums.push(val);
	}

	if(sums.length == totaldp && totaldp > 0)
	{
	    sums.push('.');
	}
    }

    if(negative)
    {
	sums.push('-');
    }

    createEmptyRow(table, width);

    row = table.rows[table.rows.length - 1];

    additionStep(row, sums, width, width);
}

function additionStep(row, sums, width, position)
{
    position--;

    row.cells[position].innerHTML = sums[width - (position + 1)];

    if(position > (width - sums.length))
    {
	setTimeout(additionStep, speed, row, sums, width, position);
    }
}

function placeDigits(table, digits, width)
{
    var row = table.insertRow(-1);
    for(var i = 0; i < width; i++)
    {
	var c = row.insertCell(-1);
	if(width - i - 1 < digits.length)
	{
	    c.innerHTML = digits[width - i - 1];
	}
    }
}