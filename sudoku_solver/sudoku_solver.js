(function()
 {
     var board = document.getElementById('sudokuboard');

     var MAX_CHUNKS = 9;
     
     function square()
     {
	 this.cells = [];
	 this.posibilities = [1,2,3,4,5,6,7,8,9];
     }

     function row()
     {
	 this.cells = [];
	 this.posibilities = [1,2,3,4,5,6,7,8,9];
     }

     function column()
     {
	 this.cells = [];
	 this.posibilities = [1,2,3,4,5,6,7,8,9];
     }

     var squares = [];
     var rows = [];
     var columns = [];

     for(let i = 0; i < MAX_CHUNKS; i++)
     {
	 squares.push(new square());
	 rows.push(new row());
	 columns.push(new columns());
     }
     
     function cell()
     {
	 this.posibilities = [1,2,3,4,5,6,7,8,9];
	 this.value = 0;
	 this.square = null;
	 this.row = null;
	 this.column = null;
     }

     cell.prototype.set_value = function(value)
     {
	 if(this.can_have_this_value(value))
	 {
	     this.value = value;
	 }
     };

     var cells = [];

     var MAX_CELLS = 81;

     for(let i = 0; i < MAX_CELLS; i++)
     {
	 let new_cell = new cell();
	 cells.push(new_cell);
	 let row_index = math.floor(i/MAX_CHUNKS); 
	 let row = rows[row_index];
	 new_cell.row = row;
	 row.cells.push(new_cell);
	 let column_index = i%MAX_CHUNKS;
	 let column = columns[column_index];
	 new_cell.column = column;
	 column.cells.push(new_cell);
	 let square_index = math.floor(column_index/3) + (math.floor(row_index/3))*3;
	 let square = squares[square_index];
	 new_cell.square = square;
	 square.cells.push(new_cell);
     }
     
 })();
