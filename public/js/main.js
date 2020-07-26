//Beginning of main
var game;

function newGame(opts = {}) {
  game = new Minesweeper(opts);
}

$(document).ready(function () {
  $("#save-btn").hide();
  $("#restart-btn").hide();
  $("#board").hide();

  // Starts up a new game once button is clicked
  $("#play-btn").on("click", function () {
    $(this).hide();
    $("#load-btn").hide();
    const opts = {
      rows: 10,
      cols: 10,
      mines: 10,
    };

    $("#board").toggle();

    newGame(opts);
  });

  // Provide functionality to detect click on a cell
  // and revealed them. Check if game is over on each click
  $("#board").on("click", ".col.hidden", function () {
    var cellElement = $(this);

    var gridCell = game.grid[cellElement.data("row")][cellElement.data("col")];

    if (!gridCell.isRevealed && game.playing) {
      if (cellElement.hasClass("mine")) {
        game.gameOver(false);
        game.movesMade++;
        // $("#restart-btn").toggle();
      }
      if (game.movesMade === 0) game.placeMines();
      game.revealCell(gridCell);
      game.movesMade++;
      const isGameOver = $(".col.hidden").length === game.gameOptions.mines;
      if (isGameOver) {
        game.gameOver(true);
        // $("#restart-btn").toggle();
      }
    }
    $("#restart-btn").show();
    $("#save-btn").show();
  });

  //Flag cells on right click

  $("#board").on("contextmenu", ".col.hidden", function (e) {
    e.preventDefault();

    const cellElement = $(this);

    const gridCell =
      game.grid[cellElement.data("row")][cellElement.data("col")];

    if (!gridCell.isRevealed && game.playing && game.movesMade != 0) {
      game.movesMade++;
      game.flagCell(gridCell);
    }
  });

  // Restart button action on click

  $("#restart-btn").on("click", function () {
    const opts = {
      rows: 10,
      cols: 10,
      mines: 10,
    };
    newGame(opts);
  });

  // Implement fetch to send the grid data to DB

  $("#save-btn").on("click", async function () {
    game.savedGame = true;
    var data = game;
    var options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    const response = await fetch("/api", options);
    const json = await response.json();
    // console.log(json);
  });
  //Load a game from the server
  $("#load-btn").on("click", async function () {
    $(this).hide();
    $("#play-btn").hide();
    fetch("/load")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        $("#board").toggle();
        // console.log(typeof data);
        const jsonData = data;
        game = new Minesweeper({}, jsonData);
        // console.log(data);
        //game.showBoard();
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
