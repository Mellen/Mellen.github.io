(function()
 {
     let parameters = [];
     const CURVE = 0;
     const STRAIGHT = 2;
     const RED = 3;
     const GREEN = 4;
     const BLUE = 5;
     const ALPHA = 6;
     const CANVAS = 7;
     const WIDTH = 128;
     const HEIGHT = 192;
     const KERNEL_SIZE = 9;
     const KERNEL_WIDTH = 3;

     const mainElement = document.getElementById('main');

     const sharpenKernel = [0,0,0,0, -1,-1,-1,-1, 0,0,0,0, -1,-1,-1,-1, 5,5,5,5 -1,-1,-1,-1, 0,0,0,0, -1,-1,-1,-1, 0,0,0,0];
     const edgeKernel = [-1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, 8,8,8,8 -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1];
     const blurKernel = [1/16,1/16,1/16,1/16, 1/8,1/8,1/8,1/8, 1/16,1/16,1/16,1/16, 1/8,1/8,1/8,1/8, 1/4,1/4,1/4,1/4, 1/8,1/8,1/8,1/8, 1/16,1/16,1/16,1/16, 1/8,1/8,1/8,1/8, 1/16,1/16,1/16,1/16];

     const affectAllPixels = new Uint8Array(WIDTH*HEIGHT*4).fill(1);
     
     let selectedParameters = [];

     document.getElementById('btnGenerate').addEventListener('click', generateFromSelection);
     
     for(let i = 0; i < 100; i++)
     {
	 let prom = new Promise((resolve, reject) => { setTimeout(function() 
	     {
		 let convColour = Array(KERNEL_SIZE*4).fill(0).map(_ => Math.random());

		 let originalPixels = new Uint8ClampedArray(WIDTH*HEIGHT*4).fill(0).map(_ => Math.floor(Math.random()*256));
		 let affectedPixels = new Uint8Array(WIDTH*HEIGHT*4).fill(0);

		 for(let api = 0; api < affectedPixels.length; api += 4)
		 {
		     let affected = Math.floor(Math.random()*10) < 4;
		     if(affected)
		     {
			 affectedPixels[api] = 1;
			 affectedPixels[api+1] = 1;
			 affectedPixels[api+2] = 1;
			 affectedPixels[api+3] = 1;
		     }
		 }
		 
		 let imageData = new ImageData(originalPixels, WIDTH, HEIGHT);
		 
		 const canv = document.createElement('canvas');
		 canv.width = WIDTH;
		 canv.height = HEIGHT;

		 canv.addEventListener('click', (e) => selectImage(i, canv));

		 const ctx = canv.getContext('2d');
		 ctx.fillStyle = "rgb(255, 255, 255)";
		 ctx.fillRect(0, 0, WIDTH, HEIGHT);

		 ctx.putImageData(imageData, 0, 0);

		 let pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;

		 let smudgeCount = Math.floor(Math.random()*5) +1 ;
		 
		 for(let smudges = 0; smudges < smudgeCount; smudges++)
		 {
		     pixels = convolveColour(pixels, convColour, affectedPixels);
		 }

		 let edgepixels = convolveColour(pixels, edgeKernel, affectedPixels);
		 pixels = sumImages(pixels, edgepixels);
		 pixels = convolveColour(pixels, blurKernel, affectAllPixels);
		 
		 let newData = new ImageData(pixels, WIDTH, HEIGHT);
		 ctx.putImageData(newData, 0, 0);
		 
		 mainElement.appendChild(canv);

		 parameters.push([convColour, smudgeCount, originalPixels, affectedPixels]);

		 resolve(`done ${i+1}`);
	     }, 1);});

	 prom.then((msg) => console.log(msg));
     }

     function indexToxy(index, width)
     {
	 var point = {x:0, y:0};
	 
	 index = Math.floor(index / 4);
	 
	 point.x = index % width;
	 point.y = Math.floor(index / width);
	 
	 return point;
     }

     function xyToIndex(x, y, width)
     {
	 return (x + (y * width))*4;
     };


     function sumImages(firstPix, secondPix)
     {
	 let newPixels = new Uint8Array(firstPix.length);

	 for(let pixi = 0; pixi < firstPix.length; pixi += 4)
	 {
	     newPixels[pixi] = firstPix[pixi] + secondPix[pixi];
	     newPixels[pixi+1] = firstPix[pixi+1] + secondPix[pixi+1];
	     newPixels[pixi+2] = firstPix[pixi+2] + secondPix[pixi+2];
	     newPixels[pixi+3] = 255;
	 }

	 return new Uint8ClampedArray(newPixels);
     }

     function subtractImages(firstPix, secondPix)
     {
	 let newPixels = new Uint8ClampedArray(firstPix.length);

	 for(let pixi = 0; pixi < firstPix.length; pixi += 4)
	 {
	     newPixels[pixi] = firstPix[pixi] - secondPix[pixi];
	     newPixels[pixi+1] = firstPix[pixi+1] - secondPix[pixi+1];
	     newPixels[pixi+2] = firstPix[pixi+2] - secondPix[pixi+2];
	     newPixels[pixi+3] = 255;
	 }

	 return newPixels;
     }

     
     function convolveColour(pixels, kernel, affectedPixels)
     {
	 let kernelMidIndex = Math.ceil(KERNEL_SIZE/2);
	 let kernelMidPoint = indexToxy(kernelMidIndex*4, KERNEL_WIDTH);

	 let newPixels = new Uint8Array(pixels.length);	 
	 
	 for(let pixi = 0; pixi < pixels.length; pixi += 4)
	 {
	     if(affectedPixels[pixi] == 0)
	     {
		 continue;
	     }
	     
	     let currentPixelPoint = indexToxy(pixi, WIDTH*4);
	     for(let kerni = 0; kerni < KERNEL_SIZE*4; kerni += 4)
	     {
		 let kernelPoint = indexToxy(kerni, KERNEL_WIDTH);
		 let dx = kernelPoint.x - kernelMidPoint.x;
		 let dy = kernelPoint.y - kernelMidPoint.y;
		 let otherx = currentPixelPoint.x + dx;

		 if(otherx < 0)
		 {
		     otherx = WIDTH + otherx;
		 }
		 else if (otherx > WIDTH)
		 {
		     otherx = otherx - WIDTH;
		 }

		 let othery = currentPixelPoint.y + dy;
		 if(othery < 0)
		 {
		     othery = HEIGHT + othery;
		 }
		 else if (othery > HEIGHT)
		 {
		     othery = othery - HEIGHT;
		 }

		 let otherIndex = xyToIndex(otherx, othery, WIDTH);

		 for(let colour = 0; colour < 3; colour++)
		 {
		     newPixels[pixi+colour] += Math.round(pixels[otherIndex+colour] * kernel[kerni+colour]);   
		 }

		 newPixels[pixi+3] = 255;
	     }
	 }
	 
	 return new Uint8ClampedArray(newPixels);
     }

     function selectImage(parameterIndex, canvas)
     {
	 let indexIndex = selectedParameters.indexOf(parameterIndex);
	 if(indexIndex > -1)
	 {
	     selectedParameters.splice(indexIndex, 1);
	     canvas.classList.remove('selected');
	 }
	 else
	 {
	     if(selectedParameters.length >= 10)
	     {
		 alert('Only 10 images can be selected at once. Delected one first before selecting another.');
	     }
	     else
	     {
		 selectedParameters.push(parameterIndex);
		 canvas.classList.add('selected');
	     }
	 }

	 if(selectedParameters.length >= 10)
	 {
	     document.getElementById('btnGenerate').disabled = false;
	 }
	 else
	 {
	     document.getElementById('btnGenerate').disabled = true;
	 }

	 document.getElementById('txtSelectCount').textContent = selectedParameters.length;
     }

     function generateFromSelection()
     {
	 while(selectedParameters.length > 10)
	 {
	     selectedParameters.pop();
	 }

	 while(mainElement.children.length > 0)
	 {
	     let child = mainElement.firstChild;
	     mainElement.removeChild(child);
	 }

	 let newParameters = []
	 
	 for(let parami = 0; parami < selectedParameters.length; parami++)
	 {
	     let selectedPari = selectedParameters[parami];
	     let selectedPar = parameters[selectedPari];
	     newParameters[parami*10] = selectedPar;
	     let prom = new Promise((resolve, reject) =>
		 {
		     setTimeout(() =>
			 {
			     createImage(...selectedPar, parami*10);
			     resolve(`done parent ${parami}`);
			 }, 1);
		 });

	     prom.then(msg => console.log(msg));

	     for(let paramj = 0; paramj < selectedParameters.length; paramj++)
	     {
		 if(paramj == parami)
		 {
		     continue;
		 }
		 let index = parami*10 + paramj;
		 let innerParj = selectedParameters[paramj];
		 let innerPar = parameters[innerParj];
		 let childProm = new Promise((resolve, reject) =>
		     {
			 setTimeout(() =>
			     {
				 childParameters = blendParameters(selectedPar, innerPar);
				 newParameters[index] = childParameters;
				 createImage(...childParameters, index);
				 resolve(`done child ${parami}, ${paramj}`);
			     },1);
		     });
		 childProm.then(msg => console.log(msg));
	     }
	 }

	 selectedParameters = [];

	 parameters = newParameters;
     }

     function blendParameters(parentA, parentB)
     {
	 const [aColourKernel, aSmudgeCount, aOriginalPixels, aAffectedPixels] = parentA;
	 const [bColourKernel, bSmudgeCount, bOriginalPixels, bAffectedPixels] = parentB;

	 let colourKernel = Array(KERNEL_SIZE*4).fill(0).map((_, ki) =>
	     {
		 if(Math.random() > 0.5)
		 {
		     return bColourKernel[ki];
		 }
		 else
		 {
		     return aColourKernel[ki];
		 }
	     });
	 
	 let smudgeCount = Math.floor((aSmudgeCount + bSmudgeCount)/2);

	 let originalPixels = new Uint8ClampedArray(aOriginalPixels.length);
	 let affectedPixels = new Uint8ClampedArray(aOriginalPixels.length);

	 for(let pixi = 0; pixi < aOriginalPixels.length; pixi += 4)
	 {
	     if(Math.random() > 0.5)
	     {
		 originalPixels[pixi] = bOriginalPixels[pixi];
		 originalPixels[pixi+1] = bOriginalPixels[pixi+1];
		 originalPixels[pixi+2] = bOriginalPixels[pixi+2];
		 originalPixels[pixi+3] = bOriginalPixels[pixi+3];

		 affectedPixels[pixi] = bAffectedPixels[pixi];
		 affectedPixels[pixi+1] = bAffectedPixels[pixi+1];
		 affectedPixels[pixi+2] = bAffectedPixels[pixi+2];
		 affectedPixels[pixi+3] = bAffectedPixels[pixi+3];
	     }
	     else
	     {
		 originalPixels[pixi] = aOriginalPixels[pixi];
		 originalPixels[pixi+1] = aOriginalPixels[pixi+1];
		 originalPixels[pixi+2] = aOriginalPixels[pixi+2];
		 originalPixels[pixi+3] = aOriginalPixels[pixi+3];

		 affectedPixels[pixi] = bAffectedPixels[pixi];
		 affectedPixels[pixi+1] = bAffectedPixels[pixi+1];
		 affectedPixels[pixi+2] = bAffectedPixels[pixi+2];
		 affectedPixels[pixi+3] = bAffectedPixels[pixi+3];
	     }
	 }

	 return [colourKernel, smudgeCount, originalPixels, affectedPixels];
     }
     
     function createImage(colourKernel, smudgeCount, originalPixels, affectedPixels, index)
     {
	 let imageData = new ImageData(originalPixels, WIDTH, HEIGHT);
	 
	 const canv = document.createElement('canvas');
	 canv.width = WIDTH;
	 canv.height = HEIGHT;

	 canv.addEventListener('click', (e) => selectImage(index, canv));

	 const ctx = canv.getContext('2d');
	 ctx.fillStyle = "rgb(255, 255, 255)";
	 ctx.fillRect(0, 0, WIDTH, HEIGHT);

	 ctx.putImageData(imageData, 0, 0);

	 let pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
	 
	 for(let smudges = 0; smudges < smudgeCount; smudges++)
	 {
	     pixels = convolveColour(pixels, colourKernel, affectedPixels);
	 }

	 let edgepixels = convolveColour(pixels, edgeKernel, affectedPixels);
	 pixels = sumImages(pixels, edgepixels);
	 pixels = convolveColour(pixels, blurKernel, affectAllPixels);
	 
	 let newData = new ImageData(pixels, WIDTH, HEIGHT);
	 ctx.putImageData(newData, 0, 0);
	 
	 mainElement.appendChild(canv);
     }

     
 })();
