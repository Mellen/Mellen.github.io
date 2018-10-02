import LargeInt from '../LargeInt/largeint.js';
(function()
 {
     var btnAdd = document.getElementById('btnAdd');
     btnAdd.addEventListener('click', function(e)
			     {
				 var a = document.getElementById('txtA').value;
				 var b = document.getElementById('txtB').value;

				 var aInt = new LargeInt(a);
				 var bInt = new LargeInt(b);
				 var cInt = aInt.add(bInt);

				 document.getElementById('lblResult').innerHTML = cInt.toString();
			     });
     var btnSubtract = document.getElementById('btnSubtract');
     btnSubtract.addEventListener('click', function(e)
			     {
				 var a = document.getElementById('txtA').value;
				 var b = document.getElementById('txtB').value;

				 var aInt = new LargeInt(a);
				 var bInt = new LargeInt(b);
				 var cInt = aInt.subtract(bInt);

				 document.getElementById('lblResult').innerHTML = cInt.toString();
			     });
     var btnMax = document.getElementById('btnMax');
     btnMax.addEventListener('click', function(e)
			     {
				 var a = document.getElementById('txtA').value;
				 var b = document.getElementById('txtB').value;

				 var aInt = new LargeInt(a);
				 var bInt = new LargeInt(b);

				 let result = aInt.greaterThan(bInt) ? aInt.toString() : bInt.toString()

				 document.getElementById('lblResult').innerHTML = result;
			     });
     var btnMin = document.getElementById('btnMin');
     btnMin.addEventListener('click', function(e)
			     {
				 var a = document.getElementById('txtA').value;
				 var b = document.getElementById('txtB').value;

				 var aInt = new LargeInt(a);
				 var bInt = new LargeInt(b);

				 let result = aInt.lessThan(bInt) ? aInt.toString() : bInt.toString()

				 document.getElementById('lblResult').innerHTML = result;
			     });
     var btnTimes = document.getElementById('btnTimes');
     btnTimes.addEventListener('click', function(e)
			     {
				 var a = document.getElementById('txtA').value;
				 var b = document.getElementById('txtB').value;

				 var aInt = new LargeInt(a);
				 var bInt = new LargeInt(b);

				 let result = aInt.times(bInt);

				 document.getElementById('lblResult').innerHTML = result;
			     });
     var btnOver = document.getElementById('btnOver');
     btnOver.addEventListener('click', function(e)
			     {
				 var a = document.getElementById('txtA').value;
				 var b = document.getElementById('txtB').value;

				 var aInt = new LargeInt(a);
				 var bInt = new LargeInt(b);

				 let result = aInt.over(bInt);

				 document.getElementById('lblResult').innerHTML = result;
			     });
 })();
