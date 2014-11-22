var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var game = new Game();

var width = canvas.width;
var height = canvas.height;

var gameToViewWidthRatio = width/game.width;
var gameToViewHeightRatio = height/game.height;

var playerWidth = game.player.width * gameToViewWidthRatio;
var playerHeight = game.player.height * gameToViewHeightRatio;
var dotWidth = game.dotWidth * gameToViewWidthRatio;
var dotHeight = game.dotHeight * gameToViewHeightRatio;

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


function drawBoard()
{
    context.fillStyle = '#0000ff';
    context.fillRect(0, 0, width, height);

    if(game.player.isAlive)
    {
	drawPlayer();
    }

    if(game.level)
    {
	drawDots();
    }

    requestAnimFrame(function(){
        drawBoard();
    });

}

function drawDots()
{
    context.fillStyle = '#aa2222';
    for(var dotIndex = 0; dotIndex < game.level.dotPositions.length; dotIndex++)
    {
	var dot = game.level.dotPositions[dotIndex];
	var x = (dot.x * gameToViewWidthRatio) - (dotWidth/2);
	var y = (dot.y * gameToViewHeightRatio) - (dotHeight/2);
	context.fillRect(x, y, dotWidth, dotHeight);
    }
}

function drawPlayer()
{
    context.fillStyle = '#ffff00';
    var x = (game.player.position.x * gameToViewWidthRatio) - (playerWidth/2);
    var y = (game.player.position.y * gameToViewHeightRatio) - (playerHeight/2);
    context.fillRect(x, y, playerWidth, playerHeight);
}

game.start(0);

drawBoard();