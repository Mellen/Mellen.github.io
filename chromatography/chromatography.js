(function()
 {
     var canvas = document.getElementById('canv');
     var ctx = canvas.getContext('2d');

     var width = canvas.width;
     var height = canvas.height;

     ctx.fillStyle = '#000000';
     ctx.fillRect(0, 0, width, height);

     var friction = ctx.getImageData(0, 0, width, height);

     for(var i = 0; i < friction.data.length; i += 4)
     {
	 friction.data[i] = Math.floor(Math.random() * 6)+1;
	 friction.data[i+1] = Math.floor(Math.random() * 6)+1;
	 friction.data[i+2] = Math.floor(Math.random() * 6)+1;
     }

     var running = false;

     var drawing = false;
     
     canvas.addEventListener('mousemove', function(e)
			     {
				 if(drawing)
				 {
				     var x = e.clientX - this.offsetLeft;
				     var y = e.clientY - this.offsetTop;

				     ctx.fillStyle = '#ffffff';
				     ctx.beginPath();
				     ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
				     ctx.fill();
				 }
			     });

     canvas.addEventListener('mousedown', function(e)
			     {
				 if(!running)
				 {
				     running = true;
				     requestAnimationFrame(step);
				 }

				 drawing = true;
			     });

     canvas.addEventListener('mouseup', function(e)
			     {
				 drawing = false;
			     });

     canvas.addEventListener('mouseout', function(e)
			     {
				 drawing = false;
			     });
     
     function step()
     {
	 var data = ctx.getImageData(0, 0, width, height);
	 for(var x = 0; x < width; x++)
	 {
	     for(var y = 0; y < height; y++)
	     {
		 var index = (x + (y * width))*4;

		 var value = data.data[index] + data.data[index+1] + data.data[index+2];

		 if(value > 0)
		 {
		     if(x > 0)
		     {
			 flowLeft(x, y, data);
		     }
		     if(x < width)
		     {
			 flowRight(x, y, data);
		     }
		     if(y > 0)
		     {
			 flowUp(x, y, data);
		     }
		     if(y < height)
		     {
			 flowDown(x, y, data);
		     }
		 }
	     }
	 }
	 ctx.putImageData(data, 0, 0);
	 requestAnimationFrame(step);
     }

     function flowDown(x, y, data)
     {
	 var index = (x + (y * width))*4;
	 var otherIndex = (x + ((y+1) * width))*4;

	 flow(index, otherIndex, data);
     }

     function flowUp(x, y, data)
     {
	 var index = (x + (y * width))*4;
	 var otherIndex = (x + ((y-1) * width))*4;

	 flow(index, otherIndex, data);
     }

     function flowRight(x, y, data)
     {
	 var index = (x + (y * width))*4;
	 var otherIndex = ((x+1) + (y * width))*4;

	 flow(index, otherIndex, data);	 
     }
     
     function flowLeft(x, y, data)
     {
	 var index = (x + (y * width))*4;
	 var otherIndex = ((x-1) + (y * width))*4;

	 flow(index, otherIndex, data);
     }

     function flow(index, otherIndex, data)
     {
	 var redDelta = data.data[index] - data.data[otherIndex];
	 var greenDelta = data.data[index+1] - data.data[otherIndex+1];
	 var blueDelta = data.data[index+2] - data.data[otherIndex+2];

	 if(redDelta > 0)
	 {
	     var fric = friction.data[index];

	     var change = Math.floor(redDelta/fric);
	     
	     data.data[index] -= change;
	     data.data[otherIndex] += change;
	 }

	 if(greenDelta > 0)
	 {
	     var fric = friction.data[index+1];

	     var change = Math.floor(greenDelta/fric);

	     data.data[index+1] -= change;
	     data.data[otherIndex+1] += change;
	 }

	 if(blueDelta > 0)
	 {
	     var fric = friction.data[index+2];

	     var change = Math.floor(blueDelta/fric);

	     data.data[index+2] -= change;
	     data.data[otherIndex+2] += change;
	 }

     }
 })();
