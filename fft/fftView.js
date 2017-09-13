(()=>
 {

     function* signalGenerator(maxX)
     {
	 var x = 0;
	 while(x < maxX)
	 {
	     var real = Math.cos(Math.PI * (x/maxX));
	     var imaginary = Math.sin(Math.PI * (x/maxX));
	     var y = new FFT.ComplexNumber(real, imaginary);
	     y = y.simpleMultiply(-1);
	     var point = {x:x, y:y};
	     yield point;
	     x++;
	 }
     }

     var timePoints = signalGenerator(512);
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
	     ctx.lineTo(point.value.x, (point.value.y.phase() * canvas.height));

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
	     ctx.lineTo(point.x, canvas.height-(point.y.phase()*64));
	 }
	 ctx.stroke();
     }

     plotFrequency(freqPoints);
 })();
