function Game()
{
    this.level = null;
    this.player = new Player();
    this.width = 64;
    this.height = 48;
    this.dotWidth = 0.5;
    this.dotHeight = 0.5;
    this.wallWidth = 1;
    this.wallHeight = 1;
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
    this.width = 0.9;
    this.height = 0.9;
    this.isAlive = true;
}

var directions = {left:0, right:1, up:2, down:3};

var levels = [];

levels.push( 
{
    speed: 1,
    dotPositions: [{x:2, y:3}],
    badGuyStarts: [],
    playerStart: {x: 32, y: 28},
    wallPositions: [{x:4, y:5}]
});