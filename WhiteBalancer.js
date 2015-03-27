var redPos = 0;
var greenPos = 1;
var bluePos = 2;

function WhiteBalancer(image, threshold)
{
    this.image = image;
    this.threshold = threshold;

    this.HSV = new Float32Array(image.data.length);
}

// thanks to http://www.csgnetwork.com/csgcolorsel4.html
WhiteBalancer.prototype.createHSVFromRGBA = function()
{
    for(var pi = 0; pi < this.image.data.length; pi += 4)
    {
	var r = this.image.data[pi]/255;
	var g = this.image.data[pi + 1]/255;
	var b = this.image.data[pi + 2]/255;

	var minRGB = Math.min(b, r, g);
	var maxRGB = Math.max(b, r, g);
	var delta = maxRGB - minRGB;
	
	if(minRGB === maxRGB)
	{
	    this.HSV[pi] = 0;
	    this.HSV[pi+1] = 0;
	    this.HSV[pi+2] = minRGB;
	    continue;
	}

	var h = 0;
	
	var dR = (((maxRGB - r) / 6) + (delta / 2)) / delta;
	var dG = (((maxRGB - g) / 6) + (delta / 2)) / delta;
	var dB = (((maxRGB - b) / 6) + (delta / 2)) / delta;

	if (r == maxRGB) 
	{
	    h = dB - dG;
	}
	else if (g == maxRGB) 
	{
	    h = (1 / 3) + dR - dB;
	}
	else if (b == maxRGB) 
	{
	    h = (2 / 3) + dG - dR;
	}
		
	if (h < 0) 
	{
	    h += 1;
	}
	if (h > 1) 
	{
	    h -= 1;
	}

	this.HSV[pi] = h;
	this.HSV[pi+1] = (maxRGB - minRGB)/maxRGB;
	this.HSV[pi+2] = maxRGB;
    }
}

WhiteBalancer.prototype.findBrightestPixel = function()
{
    var maxval = 0;
    for(var pi = 0; pi < this.image.data.length; pi += 4)
    {
	var val = this.image.data[pi] + this.image.data[pi + 1] + this.image.data[pi + 2];
	if(val > maxval)
	{
	    maxval = val;
	    this.brightStart = pi;
	}
    }
}

WhiteBalancer.prototype.correctGamma = function()
{
    var gamma = 4;
    for(var pi = 0; pi < this.HSV.length; pi += 4)
    {
	this.HSV[pi+2] = Math.pow(this.HSV[pi+2], gamma);
    }
}

WhiteBalancer.prototype.createRGBFromHSV = function()
{    
    for(var pi = 0; pi < this.HSV.length; pi += 4)
    {
	var h = this.HSV[pi];
	var s = this.HSV[pi + 1];
	var v = this.HSV[pi + 2];

	if(s === 0)
	{
	    this.image.data[pi] = Math.floor(v * 255);
	    this.image.data[pi + 1] = Math.floor(v * 255);
	    this.image.data[pi + 2] = Math.floor(v * 255);

	    continue;
	}

	var i0 = Math.floor(h*6);
	var i1 = v * (1 - s);
	var i2 = v * (1 - s * ((h*6) - i0));
	var i3 = v * (1 - s * (1 - ((h*6) - i0)));
	
	var r = 0;
	var g = 0;
	var b = 0;
	
	switch(i0)
	{
	case 0: 
	    r = v; 
	    g = i3; 
	    b = i1;
	    break;

	case 1:
	    r = i2; 
	    g = v; 
	    b = i1;
	    break;

	case 2:
	    r = i1; 
	    g = v; 
	    b = i3;
	    break;

	case 3:
	    r = i1; 
	    g = i2; 
	    b = v;
	    break;

	case 4:
	    r = i3; 
	    g = i1; 
	    b = v;
	    break;

	default:
	    r = v;
	    g = i1; 
	    b = i2;	    
	}

	this.image.data[pi] = Math.floor(r * 255);
	this.image.data[pi + 1] = Math.floor(g * 255);
	this.image.data[pi + 2] = Math.floor(b * 255);
    }
}

WhiteBalancer.prototype.balance = function()
{
    this.createHSVFromRGBA();
    //this.findBrightestPixel();
    this.correctGamma();
    this.createRGBFromHSV();
}