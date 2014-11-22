var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var game = new Game();

var width = canvas.width;
var height = canvas.height;

var gameToViewWidthRatio = width/game.width;
var gameToViewHeightRatio = height/game.height;

var playerWidth = game.player.width * gameToViewWidthRatio;
var playerHeight = game.player.height * gameToViewHeightRatio;

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

    requestAnimFrame(function(){
        drawBoard();
    });

}

function drawPlayer()
{
    context.fillStyle = '#ffff00';
    var x = game.player.position.x * gameToViewWidthRatio;
    var y = game.player.position.y * gameToViewHeightRatio;
    context.fillRect(x, y, playerWidth, playerHeight);
}

drawBoard();