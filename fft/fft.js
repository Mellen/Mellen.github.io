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

	   ComplexNumber.prototype.phase = function()
	   {
	       var phase = Math.atan(this.real/this.imaginary);

	       if(this.real < 0)
	       {
		   if(this.imaginary >= 0)
		   {
		       phase += Math.PI;
		   }
		   else
		   {
		       phase -= Math.PI;
		   }
	       }
	       else if(this.real === 0)
	       {
		   if(this.imaginary > 0)
		   {
		       phase = Math.PI;
		   }

		   else if(this.imaginary < 0)
		   {
		      phase = -Math.PI;
		   }
	       }

	       return phase;	      
	   }

	   ComplexNumber.prototype.simpleMultiply = function(simple)
	   {
	       return new ComplexNumber(this.real * simple, this.imaginary * simple);
	   };

	   ComplexNumber.prototype.multiply = function(rhs)
	   {
	       var first = this.real * rhs.real;
	       var outer = this.real * rhs.imaginary;
	       var inner = this.imaginary * rhs.imaginary;
	       var last = this. imaginary * rhs.imaginary;
	       var newReal = first - last;
	       var newImaginary = inner + outer;
	       return new ComplexNumber(newReal, newImaginary);
	   }

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
	       var yValues = ditfft(series);
	       var output = [];
	       var x = 0;
	       for(let yValue of yValues)
	       {
		   output.push({x:x, y:yValue});
		   x++;
	       }
	       return output;
	   }

	   function ditfft(series)
	   {
	       var newSeries = bitReverseCopy(series);

	       var logLength = Math.log(series.length);
	       
	       for(let i = 1; i < logLength; i++)
	       {
		   let twoPower = Math.pow(2, i);
		   let real = Math.cos(Math.PI/(twoPower/2))
		   let imaginary = Math.sin(Math.PI/(twoPower/2))
		   let wm = new ComplexNumber(real,imaginary);
		   wm = wm.simpleMultiply(-1);
		   for(let k = 0; k < series.length; k += twoPower)
		   {
		       let w = new ComplexNumber(1, 0);
		       for(let j = 0; j < twoPower/2; j++)
		       {
			   let t = w.multiply(newSeries[k + j + twoPower/2]);
			   let u = newSeries[k + j];
			   newSeries[k + j + twoPower/2] = u.add(t);
			   newSeries[k + j] = u.minus(t);
			   w = w.multiply(wm);
		       }
		   }
	       }
	       
	       return newSeries;
	   }

	   function bitReverseCopy(series)
	   {
	       var newSeries = new Array(series.length)

	       var powerOf2 = getPowerOf2(series.length);
	       	       
	       for(var i = 0; i < series.length; i++)
	       {
		   let revi = reverseInteger(i, powerOf2-1);
		   newSeries[revi] = new ComplexNumber(series[i].real, series[i].imaginary);
	       }
	       
	       return newSeries;
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
	       if(power === undefined)
	       {
		   throw "power is undefined. reverseInterger does not have a default value for this parameter.";
	       }
	       
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
	   

	   fft.ComplexNumber = ComplexNumber;
	   return fft;
       })();
