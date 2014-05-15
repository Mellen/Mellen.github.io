var btn = document.getElementById('btnMultiply');
btn.addEventListener("click", startmultiply, false);

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

    if(dp1 > dp2)
    {
	var extraZero = '0'.repeat(dp1 - dp2)
	if(!n2.contains('.'))
	{
	    n2 += '.';
	}
	n2 += extraZero
    }
    else if(dp2 > dp1)
    {
	var extraZero = '0'.repeat(dp2 - dp1)
	if(!n1.contains('.'))
	{
	    n1 += '.';
	}
	n1 += extraZero
    }

    firstnumbers = n1.split('');
    secondnumbers = n2.split('');
    var width = firstnumbers.length + secondnumbers.length
    if(n1.contains('.') || n2.contains('.'))
    {
	width--;
    }

    var firstrow = table.insertRow();
    for(var i = 0; i < width; i++)
    {
	var c = firstrow.insertCell();
	if(width - i <= firstnumbers.length)
	{
	    var place = firstnumbers.length - (width - i);
	    c.innerHTML = firstnumbers[place];
	}
    }

    var secondrow = table.insertRow();
    for(var i = 0; i < width; i++)
    {
	var c = secondrow.insertCell();
	if(width - i <= secondnumbers.length)
	{
	    var place = secondnumbers.length - (width - i);
	    c.innerHTML = secondnumbers[place];
	}
    }

}