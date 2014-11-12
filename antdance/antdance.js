var canvas = document.getElementById('canMain');
var context = canvas.getContext("2d");

var width = canvas.width;
var height = canvas.height;

var dir = {up:0, down:1, left:2, right:3};

var facing = dir.up;

context.fillStyle = '#ffffff';

context.fillRect(0,0,width,height);

window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();


function animate(position)
{
    var pixel = context.getImageData(position.x, position.y, 1, 1);

    var left = false;

    if(pixel.data[0] == 0)
	{
	    left = true;
	    pixel.data[0] = 255;
	    pixel.data[1] = 255;
	    pixel.data[2] = 255;
	}
    else
	{
	    pixel.data[0] = 0;
	    pixel.data[1] = 0;
	    pixel.data[2] = 0;	    
	}

    context.putImageData(pixel, position.x, position.y);

    position = newPosition(left, position);

    // request new frame
    requestAnimFrame(function(){
        animate(position);
    });
}

function newPosition(turnLeft, curPos)
{
    var newpos = {x: curPos.x, y: curPos.y};

    if(turnLeft)
	{
	    if(facing == dir.up)
		{
		    facing = dir.left;
		}
	    else if(facing == dir.left)
		{
		    facing = dir.down;
		}
	    else if(facing == dir.down)
		{
		    facing = dir.right;
		}	
	    else if(facing == dir.right)
		{
		    facing = dir.up;
		}	
	}
    else
	{
	    if(facing == dir.up)
		{
		    facing = dir.right;
		}
	    else if(facing == dir.right)
		{
		    facing = dir.down;
		}
	    else if(facing == dir.down)
		{
		    facing = dir.left;
		}	
	    else if(facing == dir.left)
		{
		    facing = dir.up;
		}	
	}

    if(facing == dir.up)
	{
	    newpos.y++;
	}
    else if(facing == dir.down)
	{
	    newpos.y--;
	}
    else if(facing == dir.left)
	{
	    newpos.x--;
	}
    else if(facing == dir.right)
	{
	    newpos.x++;
	}

    if(newpos.x >= width)
	{
	    newpos.x = 0;
	}
    else if(newpos.x < 0)
	{
	    newpos.x = width - 1;
	}

    if(newpos.y >= height)
	{
	    newpos.y = 0;
	}
    else if(newpos.y < 0)
	{
	    newpos.y = height - 1;
	}

    return newpos;
}

animate({x: width / 2, y: height / 2});