(function()
 {
     var canvas = document.getElementById('canv');
     var context = canvas.getContext('2d');
     var TWOPI = 2 * Math.PI;

     var start = [Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)];

     var r = 0;
     var g = 1;
     var b = 2;
     var a = 3;

     var up = [(start[r]<255), (start[g]<255), (start[b]<255), (start[a]<255)];
     
     function step(ts)
     {
	 var id = context.getImageData(0, 0, canvas.width, canvas.height);
	 for(let i = 0; i < id.data.length; i+=4)
	 {
	     let x = (i/4) % id.width;
	     let y = (i/4) / id.width;
	     let red = getPointInWave(start[r], x, id.width);
	     let blue = getPointInWave(start[b], y, id.height);
	     let green = getPointInWave(start[g], x+y, id.width+id.height);
	     let alpha = getPointInWave(start[a], y, id.height);
	     id.data[i] = red;
	     id.data[i+g] = green;
	     id.data[i+b] = blue;
	     id.data[i+a] = 255;//alpha;
	 }

	 for(let i = 0; i < 4; i++)
	 {
	     if(up[i])
	     {
		 if(start[i] < 255)
		 {
		     start[i]++;
		 }
		 else
		 {
		     start[i]--;
		     up[i] = false;
		 }
	     }
	     else
	     {
		 if(start[i] > 0)
		 {
		     start[i]--;
		 }
		 else
		 {
		     start[i]++;
		     up[i] = true;
		 }
	     }
	 }
	 
	 context.putImageData(id, 0, 0);
	 requestAnimationFrame(step);
     }

     function getPointInWave(colour, extra, length)
     {
	 var c1 = ((colour+extra)/(255+length))*TWOPI;
	 var sined = Math.sin(c1);
	 var result = Math.floor(sined * 256)+127;
	 return result;
     }

     requestAnimationFrame(step);
 })();
