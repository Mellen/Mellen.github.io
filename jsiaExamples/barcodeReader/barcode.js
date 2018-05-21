(function()
 {
     var canvas = document.getElementById('canvas');
     var ctx = canvas.getContext('2d');
     var canvas2 = document.getElementById('canvas2');
     var ctx2 = canvas2.getContext('2d');
     
     var numberOut = document.getElementById('number');

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

	 if(parts != null)
	 {
	     var number = calculateNumber(parts);
	 }
     }

     var codeNumberMap = 
	 {
	     '3-2-1-1': 0,
	     '2-2-2-1': 1,
	     '2-1-2-2': 2,
	     '1-4-1-1': 3,
	     '1-1-3-2': 4,
	     '1-2-3-1': 5,
	     '1-1-1-4': 6,
	     '1-3-1-2': 7,
	     '1-2-1-3': 8,
	     '3-1-1-2': 9,
	 };

     var forwardDecisionTree = 
	 {
	     '1': 
	     {
		 '1':
		 {
		     '1':
		     {
			 '4': 6
		     },
		     '3':
		     {
			 '2': 4
		     }
		 },
		 '2':
		 {
		     '1':
		     {
			 '3': 8 
		     },
		     '3':
		     {
			 '1': 5
		     }
		 },
		 '3':
		 {
		     '1':
		     {
			 '2': 7
		     }
		 },
		 '4':
		 {
		     '1':
		     {
			 '1': 3
		     }
		 }
	     },
	     '2':
	     {
		 '1':
		 {
		     '2':
		     {
			 '2': 2
		     }		     
		 },
		 '2':
		 {
		     '2':
		     {
			 '1': 1
		     }
		 }
	     },
	     '3':
	     {
		 '1':
		 {
		     '1':
		     {
			 '2': 9
		     }

		 },
		 '2':
		 {
		     '1':
		     {
			 '1': 0
		     }
		 }
	     }
	 };

     var backwardsDecisionTree = 
	 {
	     '1':
	     {
		 '1':
		 {
		     '2':
		     {
			 '3': 0
		     },
		     '4':
		     {
			 '1': 3
		     }
		 },
		 '2':
		 {
		     '2':
		     {
			 '2': 1
		     }
		 },
		 '3':
		 {
		     '2':
		     {
			 '1': 5
		     }
		 }
	     },
	     '2':
	     {
		 '1':
		 {
		     '1':
		     {
			 '3': 9
		     },
		     '3':
		     {
			 '1': 7
		     }
		 },
		 '2':
		 {
		     '1':
		     {
			 '2': 2
		     }
		 },
		 '3':
		 {
		     '1':
		     {
			 '1': 4
		     }
		 }
	     },
	     '3':
	     {
		 '1':
		 {
		     '2':
		     {
			 '1': 8
		     }
		 }
	     },
	     '4':
	     {
		 '1':
		 {
		     '1':
		     {
			 '1': 6
		     }
		 }
	     }
	 };

     function getMinMaxProp(obj)
     {
	 var max = '0';
	 var min = '5';
	 for(var p in obj)
	 {
	     if(obj.hasOwnProperty(p))
	     {
		 if(p > max)
		 {
		     max = p;
		 }

		 if(p < min)
		 {
		     min = p;
		 }
	     }
	 }

	 return {'max': max, 'min': min};
     }

     function calculateNumber(parts)
     {
	 var lefts = [];

	 var totalWidth = parts.reduce(function(inp, acc) { return acc + inp.width; });
	 var maxBlackSingle = Math.max(parts[0].width, Math.max(parts[2].width, Math.max(parts[parts.length-1].width, parts[parts.length - 3].width)));
	 var minBlackSingle = Math.min(parts[0].width, Math.min(parts[2].width, Math.min(parts[parts.length-1].width, parts[parts.length - 3].width)));
	 var maxWhiteSingle = Math.max(parts[1].width, parts[parts.length-2].width);
	 var minWhiteSingle = Math.min(parts[1].width, parts[parts.length-2].width); 

	 console.log('getting left number');
	 for(var i = 3; i < 27; i+=4)
	 {
	     lefts.push(getNumber([parts[i], parts[i+1], parts[i+2], parts[i+3]], totalWidth, maxBlackSingle, minBlackSingle, maxWhiteSingle, minWhiteSingle, i));
	 }  

	 var rights = [];

	 console.log('getting right number');
	 for(var i = 32; i < 56; i+=4)
	 {
	     rights.push(getNumber([parts[i], parts[i+1], parts[i+2], parts[i+3]], totalWidth, maxBlackSingle, minBlackSingle, maxWhiteSingle, minWhiteSingle, i));
	 }  

	 checkDigit = getCheckDigit(lefts.concat(rights));

	 numberOut.textContent = lefts.concat(rights).join('') + ' check digit: ' + checkDigit;
     }

     function getCheckDigit(digits)
     {
	 var oddSum = 0;

	 for(var i= 0; i < digits.length; i+=2)
	 {
	     oddSum += digits[i];
	 }

	 var check = oddSum * 3;

	 var evenSum = 0;

	 for(var i = 1; i < digits.length - 1; i+=2)
	 {
	     evenSum += digits[i];
	 }

	 check += evenSum;

	 check = check % 10;

	 check = 10 - check;

	 return check;
     }

     function getNumber(parts, totalWidth, maxBlackSingle, minBlackSingle, maxWhiteSingle, minWhiteSingle, temp)
     {
	 var maxwidth = Math.max(parts[0].width, Math.max(parts[1].width, Math.max(parts[2].width, parts[3].width)));
	 var minwidth = Math.min(parts[0].width, Math.min(parts[1].width, Math.min(parts[2].width, parts[3].width)));

	 bigRatio = [Math.round(maxwidth/parts[0].width).toString(), Math.round(maxwidth/parts[1].width).toString(), Math.round(maxwidth/parts[2].width).toString(), Math.round(maxwidth/parts[3].width).toString()];
	 smallRatio = [Math.round(parts[0].width/minwidth).toString(), Math.round(parts[1].width/minwidth).toString(), Math.round(parts[2].width/minwidth).toString(), Math.round(parts[3].width/minwidth).toString()];

	 smallErr = 0;

	 var next = forwardDecisionTree[smallRatio[0]];

	 if(typeof next === 'undefined')
	 {
	     var minmax = getMinMaxProp(forwardDecisionTree);
	     if(smallRatio[0] > minmax.max)
	     {
		 next = forwardDecisionTree[minmax.max];
	     }
	     else
	     {
		 next = forwardDecisionTree[minmax.min];
	     }

	     smallErr = 1;
	 }

	 var last = next;

	 next = next[smallRatio[1]];
	 
	 if(typeof next === 'undefined')
	 {
	     var minmax = getMinMaxProp(last);
	     if(smallRatio[1] > minmax.max)
	     {
		 next = last[minmax.max];
	     }
	     else
	     {
		 next = last[minmax.min];
	     }

	     smallErr++;
	 }

	 last = next;

	 next = next[smallRatio[2]];
	 
	 if(typeof next === 'undefined')
	 {
	     var minmax = getMinMaxProp(last);
	     if(smallRatio[2] > minmax.max)
	     {
		 next = last[minmax.max];
	     }
	     else
	     {
		 next = last[minmax.min];
	     }

	     smallErr++;
	 }

	 last = next;

	 next = next[smallRatio[3]];
	 
	 if(typeof next === 'undefined')
	 {
	     var minmax = getMinMaxProp(last);
	     if(smallRatio[3] > minmax.max)
	     {
		 next = last[minmax.max];
	     }
	     else
	     {
		 next = last[minmax.min];
	     }

	     smallErr++;
	 }	 

	 console.log(smallErr);

	 return next;
     }

     function calculateBarcodeLines(coords, imageData)
     {
	 var startIndex = jsia.xyToIndex(0, coords.y, imageData.width);

	 for(var i = startIndex; i < startIndex + (imageData.width*4); i += 4)
	 {
	     var pixel = Math.min(imageData.data[i], Math.min(imageData.data[i+1], imageData.data[i+2]));
	     if(pixel > 96)
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
		 var width = {x: currentX, width:currentWidth, isblack:pixel==0};
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
		 if(typeof widths != 'undefined')
		 {
		     widths = removeAboveAverage(widths);
		 }
		 else
		 {
		     return null;
		 }
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
		     if(indexGroups[i].length == 59)
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