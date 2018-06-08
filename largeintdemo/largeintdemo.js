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
 })();
