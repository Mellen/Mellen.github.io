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

    firstnumbers = n1.split('').reverse();
    secondnumbers = n2.split('').reverse();

    var width = firstnumbers.length + secondnumbers.length
    if(n1.contains('.') || n2.contains('.'))
    {
	width--;
    }

    placeDigits(table, firstnumbers, width, 0);
    placeDigits(table, secondnumbers, width, 0);

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
	    allparts.push(parts);
	    placeDigits(table, parts, width, totaldp);
	}
	else
	{
	    pastdp1 = true;
	}
    }

    var empty = table.insertRow();
    for(var e = 0; e < width; e++)
    {
	var c = empty.insertCell();
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
    placeDigits(table, sums, width, totaldp);
}

function placeDigits(table, digits, width, dptotal)
{
    if(dptotal != 0 && digits.length <= dptotal)
    {
	digits = digits.concat('0'.repeat((dptotal - digits.length)+1).split('').map(function(z){ return parseInt(z, 10); }));
    }
    var row = table.insertRow();
    for(var i = 0; i < width; i++)
    {
	var c = row.insertCell();
	if(width - i - 1 < digits.length)
	{
	    c.innerHTML = digits[width - i - 1];
	}
    }

    if(dptotal != 0)
    {
	var c = row.insertCell(width-dptotal);
	c.innerHTML = '.';
	row.deleteCell(0);
    }
}