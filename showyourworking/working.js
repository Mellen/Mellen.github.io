var btn = document.getElementById('btnMultiply');
btn.addEventListener("click", startmultiply, false);

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

    var allparts = [];
    var pastdp1 = false;

    for(var fnindex in firstnumbers)
    {
	if(firstnumbers[fnindex] != '.')
	{
	    var newrow = table.insertRow();
	    var parts = [];
	    var fn = parseInt(firstnumbers[fnindex], 10);
	    var rem = 0;
	    for(var n = 0; n < fnindex; n++)
	    {
		parts.push(0);
	    }
	    if(pastdp1)
	    {
		parts.pop();
	    }
	    for(var snindex in secondnumbers)
	    {
		if(secondnumbers[snindex] != '.')
		{
		    var sn = parseInt(secondnumbers[snindex], 10);
		    var result = (sn*fn) + rem;
		    parts.push((result)%10)
		    rem = Math.floor(result/10);
		}
		if(parts.length == totaldp)
		{
		    parts.push('.');
		}
	    }
	    if(rem > 0)
	    {
		parts.push(rem);
	    }
	    
	    if(totaldp > 0 && parts.length <= totaldp)
	    {
		parts = parts.concat('0'.repeat((totaldp - parts.length)+2).split('').map(function(z){ return parseInt(z, 10); }));
		parts[1] = '.';
	    }

	    if(negative)
	    {
		parts.push('-');
	    }

	    allparts.push(parts);
	}
	else
	{
	    pastdp1 = true;
	}
    }

    startAnimation(table, firstnumbers, secondnumbers, allparts, width, negative, totaldp);

/*

    var sums = [];
    var rem = 0;
    for(var pi = 0; pi < allparts[allparts.length - 1].length; pi++)
    {
	var sum = 0;
	for(var partindex in allparts)
	{
	    if(allparts[partindex].length > pi)
	    {
		sum += allparts[partindex][pi]
	    }
	}
	sum += rem;
	var val = sum % 10;
	rem = Math.floor(sum / 10);
	sums.push(val);
    }
    placeDigits(table, sums, width, totaldp, negative);
*/
}

function startAnimation(table, firstnumbers, secondnumbers, allParts, width, negative, totaldp)
{
    createEmptyRow(table, width);
    multiplicationStep(table, table.rows.length - 1, allParts, 0, 0, 0, width, width, negative, totaldp);
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

function multiplicationStep(table, rowIndex, allParts, fnIndex, snIndex, apIndex, position, width, negative, totaldp)
{
    position--;

    table.rows[rowIndex].cells[position].innerHTML = allParts[apIndex][width - (position+1)];

    if(width - position == allParts[apIndex].length)
    {
	apIndex++;
	if(apIndex < allParts.length)
	{
	    createEmptyRow(table, width);
	    rowIndex++;
	    position = width;
	}
    }

    if(apIndex < allParts.length)
    {
	setTimeout(multiplicationStep, 200, table, rowIndex, allParts, fnIndex, snIndex, apIndex, position, width, negative, totaldp);
    }
    else
    {
	startAddition(table, width, allParts, negative, totaldp);
    }
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
	setTimeout(additionStep, 200, row, sums, width, position);
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