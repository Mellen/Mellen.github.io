(function()
 {
     var canvas = document.getElementById('canvas');
     var ctx = canvas.getContext('2d');

     var vid = document.getElementById('vid');
     
     jsia.setupVideoCallback(vid, capture, 500);

     function capture()
     {
	 canvas.width = vid.clientWidth;
	 canvas.height = vid.clientHeight;
	     
	 ctx.drawImage(vid, 0, 0);
	 
	 var data = ctx.getImageData(0, 0, vid.clientWidth, vid.clientHeight);

	 var coords = detectBarcode(data);

	 var startIndex = jsia.xyToIndex(0, coords.y, data.width);

	 var threshold = 24;

	 var widths = [];
	 var currentX = 0;
	 var currentWidth = 1;

	 for(var i = startIndex+4; i < startIndex + (data.width*4); i += 4)
	 {
	     if(currentWidth == 0)
	     {
		 currentWidth = 1;
		 continue;
	     }

	     var pixel = Math.max(data.data[i], Math.max(data.data[i+1], data.data[i+2]));
	     var lastPixel = Math.max(data.data[(i-4)], Math.max(data.data[(i-4)+1], data.data[(i-4)+2]));

	     if(Math.abs(pixel - lastPixel) < threshold)
	     {
		 currentWidth++;
	     }
	     else
	     {
		 var width = {x: currentX, width:currentWidth};
		 widths.push(width);
		 currentX = jsia.indexToXY(i, data.width).x;
		 currentWidth = 0;
	     }
	 }

	 if(widths.length >= 60)
	 {
	     console.log(widths);

	     for(var i = 0; i < widths.length; i++)
	     {

		 if(i % 2 == 0)
		 {
		     ctx.fillStyle = '#ff0000';
		 }
		 else
		 {
		     ctx.fillStyle = '#00ff00';
		 }
		 ctx.fillRect(widths[i].x, coords.y-3, widths[i].width, 6);
		 
	     }
 	 }
     }

     function detectBarcode(imageData)
     {
	 var edges = jsia.detectEdgePixels(imageData, 32);
	 
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

	 return barcode;
     }
 })();