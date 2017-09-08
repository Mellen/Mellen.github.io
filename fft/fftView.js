(()=>
 {
     
     function* signalGenerator(maxX)
     {
	 var x = 0;
	 while(x < maxX)
	 {
	     var realX = x/(maxX/10);
	     var point = {x:x, y: maxX - Math.exp(-realX)*maxX};
	     yield point;
	     x++;
	 }	 
     }

     var timePoints = signalGenerator(300);
     
     function plotTime(points)
     {
	 var canvas = document.getElementById('timeChart');
	 var ctx = canvas.getContext('2d');

	 var point = points.next();

	 ctx.beginPath();
	 while(!point.done) 
	 {
	     ctx.lineTo(point.value.x, point.value.y);
	     try
	     {
		 point = points.next();
	     }
	     catch(e)
	     {
		 console.log(e);
		 break;
	     }
	 }
	 ctx.stroke()
     }

     plotTime(timePoints);
     
 })();
