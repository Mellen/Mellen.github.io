FFT = (function()
       {
	   function fft(series)
	   {
	       return ditfft(series, series.length, 1);
	   }

	   function ditfft(series, count, stride)
	   {
	       if(count === 1)
	       {
		   return series;
	       }
	       else
	       {
	/*	   var left = ditfft(series, count/2, stride*2);
		   var right = ditfft(series.slice(s), count/2, stride*2);

		   var new_series = left.concat(right);

		   for(var i = 0; i < (count/2)-1; i++)
		   {
		       var t = new_series[i];
		       new_series[i] = t + (-Math.exp(Math.PI*2*(i/count))*new_series[i+(count/2)]);
		       new_series[i + (count/2)] = t - (-Math.exp(Math.PI*2*(i/count))*new_series[i+(count/2)]);
		   }

		   return new_series;
		   }*/

		   var indicies = generateIndicies(count);
		   var new_series = new Array(count).fill(0);

		   var x = 1;
		   
		   while(x < count)
		   {
		       if(x === 1)
		       {
			   var temp_series = [series[0], series[count-1]]
		       }
		       else
		       {
			   
		       }

		       for(var i = 0; i < temp_series.length; i++)
		       {
			   var t = temp_series[i];
			   new_series[i] = t + (-Math.exp(Math.PI*2*(i/x))*new_series[i+(x/2)]);
			   new_series[i + (x/2)] = t - (-Math.exp(Math.PI*2*(i/x))*new_series[i+(x/2)]);
		       }
		       
		       x = x << 1;
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
	   
	   return fft;
       })();
