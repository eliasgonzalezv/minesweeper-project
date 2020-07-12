const board = $("#board");

const ROWS = 10;
const COLS = 10;

var data = {
  grid: [],
}; //todo: implement for json
// We can use the data-row and data-col to store the position of
// each cell
// We might be able to use the board to reconstruct the game...

function createBoard(rows, cols) {
  board.empty();
  for (let i = 0; i < rows; i++) {
    // data.grid[i] = [];
    var row = $("<div>").addClass("row");
    for (let j = 0; j < cols; j++) {
      var col = $("<div>")
        .addClass("col hidden")
        .attr("data-row", i)
        .attr("data-col", j);

      if (Math.random() < 0.1) {
        col.addClass("mine");
        //position [i][j] has a mine in it
        // data.grid[i][j] = "M";
      }
      row.append(col);
    }

    board.append(row);
  }
  // For testing the data in the grid
  // console.log(data.grid);
}

function restart() {
  createBoard(ROWS, COLS);
}

function gameOver(isWin) {
  let message = null;
  let icon = null;

  if (isWin) {
    message = "YOU WON";
    icon = "fas fa-flag";
  } else {
    message = "YOU LOST";
    icon = "fas fa-bomb";
  }

  $(".col.mine").append($("<i>").addClass(icon));

  $(".col:not(.mine)").html(function () {
    let cell = $(this);
    let count = getMineCount(cell.data("row"), cell.data("col"));
    return count === 0 ? "" : count;
  });
  //todo: Find if i can eliminate the class one by one so that
  // it displays the bombs little by littl
  $(".col.hidden").removeClass("hidden");

  setTimeout(function () {
    console.log(message);
    restart();
  }, 1000);
}

function reveal(xpos, ypos) {
  // Reveal spot click and all its adjacent neighbors
  // using a dfs
  const seen = {};

  function dfs(x, y) {
    if (x >= ROWS || y >= COLS || x < 0 || y < 0) return;

    var key = `${x} ${y}`;

    var mineCount = getMineCount(x, y); //Todo: implement

    if (seen[key]) return;

    var cell = $(`.col.hidden[data-row=${x}][data-col=${y}]`);

    if (!cell.hasClass("hidden") || cell.hasClass("mine")) {
      return;
    }

    e;
    cell.removeClass("hidden");

    if (mineCount) {
      cell.text(mineCount);
      //todo: Add the count to the cell at [x][y] position of the grid
      return;
    }
    //Search adjacents until we reach an end spot
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        dfs(x + dx, y + dy);
      }
    }
  }

  dfs(xpos, ypos);
}

function getMineCount(x, y) {
  let count = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      let nextX = x + dx;

      let nextY = y + dy;

      if (nextX >= ROWS || nextY >= COLS || nextX < 0 || nextY < 0) continue;

      var cell = $(`.col.hidden[data-row=${nextX}][data-col=${nextY}]`);

      if (cell.hasClass("mine")) count++;
    }
  }

  return count;
}

board.on("click", ".col.hidden", function () {
  // console.log($(this));
  var cell = $(this);

  var row = cell.data("row");

  var col = cell.data("col");
  console.log(row, col);

  //Todo get the x,y position of the cell clicked
  if (cell.hasClass("mine")) {
    gameOver(false);
  } else {
    reveal(row, col);

    const isGameOver = $(".col.hidden").length === $(".col.mine").length;

    if (isGameOver) gameOver(true);
  }
});

restart();
