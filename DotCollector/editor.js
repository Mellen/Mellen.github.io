var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var width = canvas.width;
var height = canvas.height;

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

    requestAnimFrame(function(){
        drawBoard();
    });
}

drawBoard();