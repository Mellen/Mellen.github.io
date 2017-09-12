FFT = (function()
       {
	   function ComplexNumber(real, imaginary)
	   {
	       this.real = real;
	       this.imaginary = imaginary;
	   }

	   ComplexNumber.prototype.toString = function()
	   {
	       return '(' + this.real + ' + i' + this.imaginary + ')';
	   }

	   ComplexNumber.prototype.magnitude = function()
	   {
	       var r2 = this.real * this.real;
	       var i2 = this.imaginary * this.imaginary;
	       return Math.sqrt(r2+i2);
	   };

	   ComplexNumber.prototype.simpleMultiply = function(simple)
	   {
	       return new ComplexNumber(this.real * simple, this.imaginary * simple);
	   };

	   ComplexNumber.prototype.add = function(rhs)
	   {
	       return new ComplexNumber(this.real + rhs.real, this.imaginary + rhs.imaginary);
	   }

	   ComplexNumber.prototype.minus = function(rhs)
	   {
	       return new ComplexNumber(this.real - rhs.real, this.imaginary - rhs.imaginary);
	   }
	   
	   function fft(series)
	   {
	       var yValues = ditfft(series, series.length, 1);
	       var output = [];
	       var x = 0;
	       for(let yValue of yValues)
	       {
		   console.log(''+yValue);
		   output.push({x:x, y:yValue.magnitude()});
		   x++;
	       }
	       return output;
	   }

	   const f = function(i, length, series, t)
	   {
	       var offset;
	       if(i >= length/2)
	       {
		   offset = i - (length/2);
	       }
	       else
	       {
		   offset = i + (length/2);
	       }
	       let real = Math.cos((Math.PI*i)/(length/2));
	       let imaginary = -Math.sin((Math.PI*i)/(length/2));
	       let k = new ComplexNumber(real, imaginary);
	       k = k.simpleMultiply(series[offset]);
	       k = t.add(k);
	       return k;
	   };

	   const g = function(i, length, series, t)
	   {
	       var offset;
	       if(i >= length/2)
	       {
		   offset = i - (length/2);
	       }
	       else
	       {
		   offset = i + (length/2);
	       }
	       let real = Math.cos((Math.PI*i)/(length/2));
	       let imaginary = -Math.sin((Math.PI*i)/(length/2));
	       let k = new ComplexNumber(real, imaginary);
	       k = k.simpleMultiply(series[offset]);
	       k = t.minus(k);
	       return k;
	   };
	   
	   function ditfft(series, length, stride)
	   {
	       if(length === 1)
	       {
		   return [new ComplexNumber(series[0], 0)];
	       }
	       else
	       {
		   var indicies = generateIndicies(length);
		   var transforms = generateTransforms(length);
		   var new_series = new Array(length);

		   for(var i = 0; i < length; i++)
		   {
		       new_series[i] = doTransforms(transforms[i], series, length, indicies[i]);
		   }
	       
		   return new_series;
	       }
	   }

	   function getPowerOf2(num)
	   {
	       var p = 0;

	       while(num > 1)
	       {
		   num = num >> 1;
		   p++;
	       }
	       
	       return p;
	   }

	   // alteration of https://stackoverflow.com/a/746203/204723 by https://stackoverflow.com/users/18528/matt-j
	   function reverseInteger(inp, power)
	   {
	       var reverse = inp & 1;
	       
	       for (inp >>= 1; inp; inp >>= 1)
	       {
		   reverse <<= 1;
		   reverse |= inp & 1;
		   power--;
	       }
	       reverse <<= power;
	       return reverse;
	   }
	   
	   function generateIndicies(length)
	   {
	       var indicies = new Array(length);

	       var powerOf2 = getPowerOf2(length);

	       for(var i = 0; i < length; i++)
	       {
		   indicies[i] = reverseInteger(i, powerOf2-1);
	       }
	       return indicies;
	   }

	   function generateTransforms(length)
	   {
	       var allTransforms = [];
	       var powerOf2 = getPowerOf2(length);
	       var parts = [];
	       for(var i = 0; i < powerOf2; i++)
	       {
		   parts.unshift(Math.pow(2, i));
	       }
	       for(var i = 0; i < length; i++)
	       {
		   let k = i;
		   let transforms = [];
		   for(let part of parts)
		   {
		       if(k >= part)
		       {
			   transforms.unshift(g);
			   k -= part;
		       }
		       else
		       {
			   transforms.unshift(f);
		       }
		   }
		   
		   allTransforms.push(transforms);
	       }
	       return allTransforms;
	   }

	   function doTransforms(transforms, series, length, index)
	   {
	       var result = new ComplexNumber(series[index], 0);
	       for(let transform of transforms)
	       {
		   result = transform(index, length, series, result);
	       }
	       return result;
	   }

	   return fft;
       })();
