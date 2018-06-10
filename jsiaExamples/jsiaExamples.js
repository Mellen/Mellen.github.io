(function()
 {
     var img = document.getElementById('jsiaImg');

     var canvas = document.getElementById('canv');
     canvas.width = img.width*3;
     canvas.height = img.height*3;
     var context = canvas.getContext('2d');

     var coords = document.getElementById('coords');

     var lastCentre = null;

     canvas.addEventListener('mousemove', function(e)
			   {
			       if(lastCentre != null)
			       {
				   invert9Pixels(lastCentre);
			       }

			       lastCentre = {x: e.offsetX, y: e.offsetY};

			       invert9Pixels(lastCentre);
			   });

     function invert9Pixels(centre)
     {
	 var data = context.getImageData(centre.x - 7, centre.y - 7, 15, 15);
	 for(var i = 0; i < data.data.length; i += 4)
	 {
	     var r = data.data[i];
	     var g = data.data[i+1];
	     var b = data.data[i+2];

	     var inv = jsia.invertPixelColour(r, g, b, 255, false);

	     data.data[i] = inv.r;
	     data.data[i+1] = inv.g;
	     data.data[i+2] = inv.b;
	 }
	 context.putImageData(data, centre.x - 7, centre.y - 7);
     }

     img.addEventListener('load', function()
     {
	 var data = jsia.getImageDataFromImg(img);

	 var greyData = jsia.imageDataToGreyScale(data, true);
	 context.putImageData(greyData, 0, 0);

	 var greyDarkData = jsia.imageDataToGreyScale(data, false);
	 context.putImageData(greyDarkData, 0, img.height);

	 var invertedData = jsia.imageDataInvertedColour(data, false);
	 context.putImageData(invertedData, 0, img.height*2);

	 var edgeData = jsia.detectEdgePixels(data, 16);
	 context.putImageData(edgeData, img.width, 0);

	 console.log('pre-lines');
	 
	 var lines = jsia.lineDetection(data, 16, 8, 3);

	 console.log(lines.length);

	 var colours = ['red', 'green', 'blue', 'black'];
	 
	 // var line = lines[3];
	 // console.log(line);
	 // 		   context.beginPath();
	 // 		   context.moveTo(line[0].x + data.width, line[0].y + data.height);
	 // 		   line.shift();
	 // 		   line.forEach(point => context.lineTo(point.x+ data.width, point.y+ data.height));
	 // 		   context.stroke();
	 
	 lines.forEach(line =>
	 	       {
			   let colour = colours.pop();
			   context.strokeStyle = colour;
	 		   context.beginPath();
	 		   context.moveTo(line[0].x + data.width, line[0].y + data.height);
	 		   line.shift();
	 		   line.forEach(point => context.lineTo(point.x+ data.width, point.y+ data.height));
	 		   context.stroke();
			   colours.unshift(colour);
	 	       });

	 console.log('lines done');
	 
     });

}());
