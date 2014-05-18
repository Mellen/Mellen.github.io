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
	    }
	    if(rem > 0)
	    {
		parts.push(rem);
	    }
	    
	    if(totaldp != 0 && parts.length <= totaldp)
	    {
		parts = parts.concat('0'.repeat((totaldp - parts.length)+1).split('').map(function(z){ return parseInt(z, 10); }));
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
    var empty = table.insertRow(-1);
    for(var e = 0; e < width; e++)
    {
	var c = empty.insertCell(-1);
	c.innerHTML = '&#151;';
    }

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
    var row = table.insertRow(-1);
    setTimeout(multiplicationStep, 1, table, row, firstnumbers, secondnumbers, allParts, 0, 0, 0, 0, width, negative, totaldp);
}

function multiplicationStep(table, row, firstnumbers, secondnumbers, allParts, fnIndex, snIndex, apIndex, position, width, negative, totaldp)
{
    var c = row.insertCell(-1);

    if(width - position - 1 < allParts[apIndex].length)
    {
	c.innerHTML = allParts[apIndex][width - position - 1];
    }

    position++;

    if(position == width)
    {
	position = 0;
	
	if(totaldp != 0)
	{
	    var c = row.insertCell(width-totaldp);
	    c.innerHTML = '.';
	    row.deleteCell(0);
	}

	if(negative)
	{
	    var negidx = width - (allParts[apIndex].length + 1);
	    if(totaldp > 0)
	    {
		negidx--;
	    }
	    table.rows[table.rows.length - 1].cells[negidx].innerHTML = '-';
	}

	apIndex++;
	if(apIndex < allParts.length)
	{
	    row = table.insertRow(-1);
	}
    }

    if(apIndex < allParts.length)
    {
	setTimeout(multiplicationStep, 200, table, row, firstnumbers, secondnumbers, allParts, fnIndex, snIndex, apIndex, position, width, negative, totaldp);
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