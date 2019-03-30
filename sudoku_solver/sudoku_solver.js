(function()
 {
     var board_view = document.getElementById('sudokuboard');

     var MAX_CHUNKS = 9;
     var MAX_CELLS = 81;

     function Container()
     {
	 this.cells = [];
	 this.posibilities = [1,2,3,4,5,6,7,8,9];
     }

     Container.prototype.update = function(input_cell, value)
     {
	 this.posibilities = this.posibilities.filter(item => item !== value);
	 for(let i = 0; i < this.cells.length; i++)
	 {
	     let cell = this.cells[i];
	     if(cell !== input_cell)
	     {
		 cell.update_posibilities(value);
	     }
	 }
     };
     
     function Cell()
     {
	 this.posibilities = [1,2,3,4,5,6,7,8,9];
	 this.value = 0;
	 this.square = null;
	 this.row = null;
	 this.column = null;
	 this.update_handler = null;
     }
     
     Cell.prototype.set_value = function(value)
     {
	 let value_set = false;
	 if(this.can_have_this_value(value))
	 {
	     this.value = value;
	     this.square.update(this, value);
	     this.row.update(this, value);
	     this.column.update(this, value);
	     value_set = true;
	     if(this.update_handler != null)
	     {
		 this.update_handler(value);
	     }
	 }
	 return value_set;
     };

     Cell.prototype.can_have_this_value = function(value)
     {
	 var can = true;

	 if(this.posibilities.indexOf(value) == -1)
	 {
	     can = false;
	 }

	 if(this.square.posibilities.indexOf(value) == -1)
	 {
	     can = false;
	 }
	     
	 if(this.row.posibilities.indexOf(value) == -1)
	 {
	     can = false;
	 }

	 if(this.square.posibilities.indexOf(value) == -1)
	 {
	     can = false;
	 }

	 return can;
     };

     Cell.prototype.update_posibilities = function(value)
     {
	 if(this.posibilities.indexOf(value) > -1)
	 {
	     this.posibilities = this.posibilities.filter(input => input != value);
	 }

	 if(this.posibilities.length === 1 && this.value === 0)
	 {
	     this.set_value(this.posibilities[0]);
	     this.posibilities.pop();
	 }
     };

     function Board()
     {
	 this.rows = [];
	 this.columns = [];
	 this.squares = [];
	 this.state = [];
	 this.cells = [];

	 for(let i = 0; i < MAX_CHUNKS; i++)
	 {
	     this.squares.push(new Container());
	     this.rows.push(new Container());
	     this.columns.push(new Container());
	 }

	 for(let i = 0; i < MAX_CELLS; i++)
	 {
	     let new_cell = new Cell();
	     this.cells.push(new_cell);
	     let row_index = Math.floor(i/MAX_CHUNKS); 
	     let row = this.rows[row_index];
	     new_cell.row = row;
	     row.cells.push(new_cell);
	     let column_index = i%MAX_CHUNKS;
	     let column = this.columns[column_index];
	     new_cell.column = column;
	     column.cells.push(new_cell);
	     let square_index = Math.floor(column_index/3) + (Math.floor(row_index/3))*3;
	     let square = this.squares[square_index];
	     new_cell.square = square;
	     square.cells.push(new_cell);
	 }
     }

     Board.prototype.undo = function(cell, board_view)
     {
	 let state = this.state.pop();
	 while(state[0] !== cell)
	 {
	     state = this.state.pop();
	 }

	 let cell_index = this.cells.indexOf(cell);

	 let state_board = state[1];
	 
	 let cell_views = board_view.getElementsByTagName('input');

	 for(let text_i = 0; text_i < cell_views.length; text_i++)
	 {
	     let text = cell_views[text_i];
	     text.removeEventListener('change', text.ch);
	     let new_cell = state_board.cells[text_i];
	     let ch = createChangeHandler(new_cell);
	     text.addEventListener('change', ch);
	     text.ch = ch;
	     new_cell.update_handler = create_view_updater(text);
	     if(new_cell.value == 0)
	     {
		 text.value = '';
	     }
	     else
	     {
		 text.value = new_cell.value;
	     }
	 }

	 return [cell_index, state_board];
     }

     Board.prototype.save_state = function(cell)
     {
	 let state = new Board();

	 for(var cell_i = 0; cell_i < state.cells.length; cell_i++)
	 {
	     let new_cell = state.cells[cell_i];
	     let cur_cell = this.cells[cell_i];
	     new_cell.set_value(cur_cell.value);
	 }
	 
	 this.state.push([cell, state]);
     }
     
     var sudoku_board = new Board();
     
     for(let row_i = 0; row_i < sudoku_board.rows.length; row_i++)
     {
	 let row = sudoku_board.rows[row_i];
	 let tr = document.createElement('tr');
	 for(let cell_i = 0; cell_i < row.cells.length; cell_i++)
	 {
	     let cell = row.cells[cell_i];
	     let td = document.createElement('td');
	     let text = document.createElement('input');
	     text.setAttribute('type', 'text');
	     text.setAttribute('pattern', '\\d');
	     let classname = '';
	     if(row_i == 2 || row_i == 5)
	     {
		 
		 classname = 'barrier_bottom'
	     }
	     if(cell_i % 3 == 0 && cell_i % 9 !== 0)
	     {
		 classname += ' barrier_side';
	     }
	     td.setAttribute('class', classname);
	     let ch = createChangeHandler(cell);
	     text.addEventListener('change', ch);
	     text.ch = ch;
	     cell.update_handler = create_view_updater(text);
	     td.appendChild(text);
	     tr.appendChild(td);
	 }
	 board_view.appendChild(tr);
     }

     function createChangeHandler(cell)
     {
	 function updateCell(e)
	 {
	     if(this.validity.patternMismatch === false)
	     {
		 if(cell.value !== Number(this.value))
		 {
		     let new_value = this.value;
		     if(cell.value !== 0)
		     {
			 let undo_result = sudoku_board.undo(cell, board_view);
			 sudoku_board = undo_result[1];
			 let cell_index = undo_result[0];
			 cell = sudoku_board.cells[cell_index];
		     }
		     cell.set_value(Number(new_value));
		     sudoku_board.save_state(cell);
		 }
	     }
	     else
	     {
		 this.value = cell.value.toString();
	     }
	 }

	 return updateCell;
     }

     function create_view_updater(text_box)
     {
	 function update_table_cell(value)
	 {
	     text_box.value = value;
	 }

	 return update_table_cell;
     }
     
 })();
