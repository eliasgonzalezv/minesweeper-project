class Minesweeper {
  constructor(opts = {}, jsonData) {
    let loadedData;
    if (jsonData) {
      console.log(jsonData);
      loadedData = jsonData.savedGame; // Saved game
      console.log(loadedData);
    } else {
      loadedData = {};
    }
    //Todo: Add support for checking if there's a saved
    //game
    //console.log(loadedData);
    Object.assign(
      this,
      {
        grid: [], //Array of Cell objects
        minesFound: 0,
        falseMines: 0,
        playing: true,
        movesMade: 0,
        savedGame: false,
        gameOptions: {
          rows: 10,
          cols: 10,
          mines: 10,
        },
      },
      { gameOptions: opts },
      loadedData
    );
    if (this.savedGame === true) {
      this.loadSaved();
    } else {
      this.populateGrid();
    }
    // this.save();
  }

  // constructor(jsonData) {
  //   let loadedData = JSON.parse(jsonData);
  //   Object.assign(
  //     this,
  //     {
  //       grid: [], //Array of Cell objects
  //       minesFound: 0,
  //       falseMines: 0,
  //       playing: true,
  //       movesMade: 0,
  //       savedGame: false,
  //       gameOptions: {
  //         rows: 10,
  //         cols: 10,
  //         mines: 10,
  //       },
  //     },
  //     { gameOptions: opts },
  //     loadedData
  //   );
  //   this.loadSaved();
  // }

  //Set up the grid
  populateGrid() {
    for (let r = 0; r < this.gameOptions["rows"]; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.gameOptions["cols"]; c++) {
        this.grid[r].push(new Cell({ xPos: r, yPos: c }));
      }
    }

    this.showBoard();
  }

  //Populate the grid from loaded data
  loadSaved() {
    for (let r = 0, r_len = this.grid.length; r < r_len; r++) {
      for (let c = 0, c_len = this.grid[r].length; c < c_len; c++) {
        this.grid[r][c] = new Cell(this.grid[r][c]);
      }
    }

    this.showBoard();
  }

  placeMines() {
    //Assign mines randomly

    let assignedMines = 0;

    while (assignedMines < this.gameOptions.mines) {
      var rowIndex = Math.floor(Math.random() * this.gameOptions.rows);
      var colIndex = Math.floor(Math.random() * this.gameOptions.cols);

      //Check if cell is not already a mine. Assign a mine and
      // increment if not.
      let cell = this.grid[rowIndex][colIndex];

      if (!cell.isMine) {
        cell.isMine = true;
        cell.value = "M";
        assignedMines++;
      }
    }
    this.updateCellValues();
    this.showBoard();
  }

  updateCellValues() {
    //Update the cell values, check for adjacent mines
    for (let r = 0; r < this.gameOptions["rows"]; r++) {
      for (let c = 0; c < this.gameOptions["cols"]; c++) {
        if (!this.grid[r][c].isMine) {
          let mineCount = 0;
          let adjCells = this.getAdjacentCells(r, c);
          for (let i = adjCells.length; i--; ) {
            if (adjCells[i].isMine) {
              mineCount++;
            }
          }
          this.grid[r][c].value = mineCount;
        }
      }
    }
  }

  showBoard() {
    const board = $("#board");
    // const board = document.getElementById("board");

    board.empty();
    // board.innerHTML = "";

    // let content = "";
    for (let r = 0; r < this.gameOptions.rows; r++) {
      // content += '<div class="row">';
      let row = $("<div>").addClass("row");
      for (let c = 0; c < this.gameOptions.cols; c++) {
        let col = $("<div>")
          .addClass("col hidden")
          .attr("data-row", r)
          .attr("data-col", c);
        let cellObj = this.grid[r][c];

        // let add_class = "";
        let txt = "";

        if (cellObj.isFlagged) {
          // add_class = "fas fa-flag";
          col.addClass("fas fa-flag");
        } else if (cellObj.isRevealed) {
          col.removeClass("hidden");
          txt = !cellObj.isMine ? cellObj.value || "" : "";
        } else if (cellObj.isMine) {
          // add_class = "mine";
          col.addClass("mine");
        }
        col.text(txt);
        row.append(col);
        // content += `<div class="col hidden ${add_class}" data-row="${r}" data-col="${c}">${txt}</div>`;
      }
      board.append(row);
      // content += "</div>";
    }
    // board.innerHTML = content;
  }

  getAdjacentCells(row, col) {
    let results = [];
    for (
      let rowPos = row > 0 ? -1 : 0;
      rowPos <= (row < this.gameOptions.rows - 1 ? 1 : 0);
      rowPos++
    ) {
      for (
        let colPos = col > 0 ? -1 : 0;
        colPos <= (col < this.gameOptions.cols - 1 ? 1 : 0);
        colPos++
      ) {
        results.push(this.grid[row + rowPos][col + colPos]);
      }
    }
    return results;
  }

  revealCell(cell) {
    if (!cell.isRevealed && !cell.isFlagged && this.playing) {
      const cellElement = cell.getCellElement();
      cell.isRevealed = true;
      cellElement.removeClass("hidden");
      cellElement.text(!cell.isMine ? cell.value || "" : "");

      // if (cell.isMine) {
      //   this.playing = false;
      // } else
      if (!cell.isFlagged && cell.value == 0) {
        // clear adjacent cells since this cell has no adjacent mines.
        const adjCells = this.getAdjacentCells(cell.xPos, cell.yPos);
        for (let i = 0, len = adjCells.length; i < len; i++) {
          this.revealCell(adjCells[i]);
        }
      }
    }
  }

  flagCell(cell) {
    if (!cell.isRevealed && this.playing) {
      const cellElement = cell.getCellElement();

      if (!cell.isFlagged) {
        cell.isFlagged = true;
        cellElement.addClass("fas fa-flag");
        if (cell.isMine) {
          this.minesFound++;
        } else {
          this.falseMines++;
        }
      } else {
        cell.isFlagged = false;
        cellElement.removeClass("fas fa-flag");

        if (cell.isMine) {
          this.minesFound--;
        } else {
          this.falseMines--;
        }
      }
    }
  }
  //Check if the game is over
  gameOver(isWin) {
    let msg = "";
    let icon = "";
    const grid = this.grid;

    if (isWin) {
      msg = "YOU WON";
      icon = "fas fa-flag";
    } else {
      msg = "YOU LOST";
      icon = "fas fa-bomb";
    }
    // console.log(msg);
    $("#game-title").text(msg);
    //Add the bomb icons to the cell
    $(".col.mine").append($("<i>").addClass(icon));
    // Reveal all cells
    $(".col:not(.mine)").html(function () {
      let cellElement = $(this);
      let gridCell = grid[cellElement.data("row")][cellElement.data("col")];
      let mineCount = gridCell.value;
      return mineCount === 0 ? "" : mineCount;
    });
    $(".col.hidden").removeClass("hidden");

    this.playing = false;

    // this.save();
  }

  //save the game to the database
  save() {
    const savedData = JSON.stringify(this);
    console.log(savedData);
  }

  //debugging function to print the grid to console
  gridToString() {
    let result = "";
    for (let r = 0, r_len = this.grid.length; r < r_len; r++) {
      for (let c = 0, c_len = this.grid[r].length; c < c_len; c++) {
        result += this.grid[r][c].value + " ";
      }
      result += "\n";
    }
    return result;
  }
}
