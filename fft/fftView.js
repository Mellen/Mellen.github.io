(()=>
 {

     function* signalGenerator(maxX)
     {
	 var x = 0;
	 while(x < maxX)
	 {
	     var real = Math.exp(-x/(maxX/2));
	     var imaginary = 0;
	     var y = new FFT.ComplexNumber(real, imaginary);
	     var point = {x:x, y:y};
	     yield point;
	     x++;
	 }
     }

     var timePoints = signalGenerator(128)
     var tpa = []

     function plotTime(points)
     {
	 var canvas = document.getElementById('timeChart');
	 var ctx = canvas.getContext('2d');

	 var point = points.next();
	 
	 tpa.push(point.value.y);
	 
	 ctx.beginPath();
	 while(!point.done) 
	 {
	     ctx.lineTo(10+point.value.x, 1.1*canvas.height-(point.value.y.real*canvas.height));

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

     var zerofill = new Array(128);
     zerofill.fill(new FFT.ComplexNumber(0,0));

     tpa = tpa.concat(zerofill);
     
     var freqPoints = FFT(tpa);

     function plotFrequency(freqPoints)
     {
	 var canvas = document.getElementById('frequencyChart');
	 var ctx = canvas.getContext('2d');

	 ctx.beginPath();
	 for(let point of freqPoints)
	 {
	     ctx.lineTo(point.x, canvas.height-(point.y.magnitude()*32));
	 }
	 ctx.stroke();
     }

     plotFrequency(freqPoints);
 })();
