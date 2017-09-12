(()=>
 {

     function* signalGenerator(maxX)
     {
	 var x = 0;
	 while(x < maxX)
	 {
	     var realX = x/(maxX/10);
	     var point = {x:x, y: Math.exp(-realX)};
	     yield point;
	     x++;
	 }
     }

     var timePoints = signalGenerator(256);
     var tpa = [];

     function plotTime(points)
     {
	 var canvas = document.getElementById('timeChart');
	 var ctx = canvas.getContext('2d');

	 var point = points.next();
	 
	 tpa.push(point.value.y);
	 
	 ctx.beginPath();
	 while(!point.done) 
	 {
	     ctx.lineTo(point.value.x, canvas.height - (point.value.y * canvas.height));
	     try
	     {
		 point = points.next();
		 tpa.push(point.value.y);
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

     var freqPoints = FFT(tpa);

     function plotFrequency(freqPoints)
     {
	 var canvas = document.getElementById('frequencyChart');
	 var ctx = canvas.getContext('2d');

	 ctx.beginPath();
	 for(let point of freqPoints)
	 {
	     ctx.moveTo(point.x, canvas.height);
	     ctx.lineTo(point.x, canvas.height-(point.y*255));
	 }
	 ctx.stroke();
     }

     plotFrequency(freqPoints);
 })();
