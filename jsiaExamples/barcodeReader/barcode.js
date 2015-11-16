(function()
 {
     var canvas = document.getElementById('canvas');
     var ctx = canvas.getContext('2d');
     var canvas2 = document.getElementById('canvas2');
     var ctx2 = canvas2.getContext('2d');

     var vid = document.getElementById('vid');
     
     jsia.setupVideoCallback(vid, capture, 10);

     function capture()
     {
	 canvas.width = vid.clientWidth;
	 canvas.height = vid.clientHeight;
	     
	 ctx.drawImage(vid, 0, 0);
	 
	 var imageData = ctx.getImageData(0, 0, vid.clientWidth, vid.clientHeight);

	 var coords = detectBarcode(imageData);
	 
	 var parts = calculateBarcodeLines(coords, imageData);
     }

     function calculateBarcodeLines(coords, imageData)
     {
	 var startIndex = jsia.xyToIndex(coords.x, coords.y, imageData.width);
	 var endIndex = jsia.xyToIndex(coords.x + imageData.width*0.10, coords.y, imageData.width);

	 var pixelMin = 255;
	 var pixelMax = 0;

	 for(var i = startIndex; i <= endIndex; i+=4)
	 {
	     var max = Math.max(imageData.data[i], Math.max(imageData.data[i+1], imageData.data[i+2]));
	     var min = Math.min(imageData.data[i], Math.min(imageData.data[i+1], imageData.data[i+2]));
	     if(max > pixelMax)
	     {
		 pixelMax = max;
	     }

	     if(min < pixelMin)
	     {
		 pixelMin = min;
	     }
	 }

	 var average = (pixelMin + pixelMax)/2;
	 console.log('average: ' + average);

	 startIndex = jsia.xyToIndex(0, coords.y, imageData.width);

	 for(var i = startIndex; i < startIndex + (imageData.width*4); i += 4)
	 {
	     var pixel = Math.min(imageData.data[i], Math.min(imageData.data[i+1], imageData.data[i+2]));
	     if(pixel > average+10)
	     {
		 imageData.data[i] = 255;
		 imageData.data[i+1] = 255;
		 imageData.data[i+2] = 255;
	     }
	     else
	     {
		 imageData.data[i] = 0;
		 imageData.data[i+1] = 0
		 imageData.data[i+2] = 0
	     }

	 }

	 var widths = [];
	 var currentX = 0;
	 var currentWidth = 1;

	 for(var i = startIndex+4; i < startIndex + (imageData.width*4); i += 4)
	 {
	     if(currentWidth == 0)
	     {
		 currentWidth = 1;
		 continue;
	     }

	     var pixel = imageData.data[i];
	     var lastPixel = imageData.data[(i-4)];

	     currentWidth++;

	     if(pixel != lastPixel)
	     {
		 var width = {x: currentX, width:currentWidth};
		 widths.push(width);
		 currentX = jsia.indexToXY(i, imageData.width).x;
		 currentWidth = 0;
	     }
	 }

	 if(widths.length >= 59)
	 {
	     widths = removeAboveAverage(widths);
	     if(typeof widths != 'undefined')
	     {
		 widths = removeAboveAverage(widths);
	     }
	     else
	     {
		 return null;
	     }

	     var gapSum = 0;
	     
	     for(var i = 0; i < widths.length-1; i++)
	     {
		 var expectedX = widths[i].x + widths[i].width + 1;
		 gapSum += Math.abs(widths[i+1].x - expectedX);
	     }

	     if(widths.length >= 59)
	     {
		 var indexGroups = [];
		 var currentIndices = [];

		 for(var i = 0; i < widths.length-1; i++)
		 {
		     var expectedX = widths[i].x + widths[i].width;
		     currentIndices.push(i);

		     if(widths[i+1].x != expectedX)
		     {
			 indexGroups.push(currentIndices);
			 currentIndices = [];
		     }
		 }

		 indexGroups.push(currentIndices);

		 var selectedGroup = -1;

		 for(var i = 0; i < indexGroups.length; i++)
		 {
		     if(indexGroups[i].length >= 59)
		     {
			 selectedGroup = i;
		     }
		 }
		 
		 if(selectedGroup != -1)
		 {
		     var newWidths = [];
		     var indices = indexGroups[selectedGroup];

		     for(var i = 0; i < indices.length; i++)
		     {
			 newWidths.push(widths[indices[i]]);
		     }

		     for(var i = 0; i < newWidths.length; i++)
		     {
			 if(i % 2 == 0)
			 {
			     ctx.fillStyle = '#ff0000';
			 }
			 else
			 {
			     ctx.fillStyle = '#00ff00';
			 }
			 ctx.fillRect(newWidths[i].x, coords.y-3, newWidths[i].width, 6);
		     }

		 canvas2.width = canvas.width;
		 canvas2.height = canvas.height;
		 var id = ctx.getImageData(0, 0, imageData.width, imageData.height);
		 ctx2.putImageData(id, 0, 0);

		 
		     return newWidths;
		 }
	     }
 	 }

	 return null;
     }

     function removeAboveAverage(widths)
     {
	 var widthSum = 0;
	 for(var i = 0; i < widths.length; i++)
	 {
	     widthSum += widths[i].width;
	 }
	 
	 var averageWidth = widthSum / widths.length;

	 var i = widths.length-1;
	 while(widths.length > 0 && i >= 0 && (typeof widths[i] != 'undefined'))
	 {
	     if(widths[i].width < (averageWidth*4))
	     {
		 i--;
	     }
	     else
	     {
		 widths.splice(i, 1);
	     }
	 }

	 return widths;
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