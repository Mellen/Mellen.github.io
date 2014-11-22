function Game()
{
    this.level = {}
    this.player = new Player();
    this.width = 64;
    this.height = 48;
}

Game.prototype.start = function (levelNumber)
{
    this.level = levels[levelNumber];
    this.player.levelNumber = levelNumber;
    this.player.position.x = this.level.playerStart.x;
    this.player.position.y = this.level.playerStart.y;
    this.player.isAlive = true;
}

function Player()
{
    this.score = 0;
    this.levelNumber = 0;
    this.position = {x:0, y:0};
    this.width = 1;
    this.height = 1;
    this.isAlive = true;
}

var directions = {left:0, right:1, up:2, down:3};

var levels = [];

levels.push( 
{
    dotPositions: [{x:2, y:3}],
    badGuyCount: 0,
    playerStart: {x: 32, y: 28},
    wallPositions: []
});