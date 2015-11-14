(function()
 {
     var canvas = document.getElementById('canvas');
     var ctx = canvas.getContext('2d');

     var vid = document.getElementById('vid');
     
     jsia.setupVideoCallback(vid, capture, 10);

     function capture()
     {
	 canvas.width = vid.clientWidth;
	 canvas.height = vid.clientHeight;
	     
	 ctx.drawImage(vid, 0, 0);
	 
	 var data = ctx.getImageData(0, 0, vid.clientWidth, vid.clientHeight);

	 detectBarcode(data);
     }

     var lastX = 0;
     var lastY = 0;

     function detectBarcode(imageData)
     {
	 var edges = jsia.detectEdgePixels(imageData, 32);
	 ctx.putImageData(edges, 0, 0);
	 
	 var barcode = {x:0, y:0, width:0, height:0};

	 var squaresize = Math.floor(edges.width/10);

	 var lastSum = 0;

	 for(var x = 0; x < edges.width; x += squaresize)
	 {
	     for(var y = 0; y < edges.height; y += squaresize)
	     {
		 var pixelSum = 0;

		 for(var p = 0; p < squaresize; p++)
		 {
		     if(p+x > edges.width || p+y > edges.height)
		     {
			 break
		     }

		     var xx = x + p;
		     var yy = y + p;

		     var index = jsia.xyToIndex(xx, yy, edges.width);
		     pixelSum += edges.data[index];
		 }

		 if(pixelSum > lastSum)
		 {
		     barcode.x = x;
		     barcode.y = y;

		     lastSum = pixelSum;
		 }
	     }
	 }

	 barcode.width = squaresize;
	 barcode.height = squaresize;

	 ctx.fillStyle = '#ff0000';
	 ctx.fillRect(barcode.x, barcode.y, barcode.width, barcode.height);

	 return barcode;
     }
 })();