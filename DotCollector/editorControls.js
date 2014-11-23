var pieceType = {wall:0, pill:1, player:2, baddie:3};

function Piece(type)
{
    this.position = {x:0, y:0};
    this.pieceType = type;
}

Piece.prototype.SetPosition(x, y)
{
    this.position = {x:x, y:y};
}