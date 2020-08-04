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

    if (!gridCell.isRevealed && game.playing && !gridCell.isFlagged) {
      if (cellElement.hasClass("mine")) {
        game.gameOver(false);
        game.movesMade++;
        // $("#restart-btn").toggle();
      }
      if (game.movesMade === 0) game.placeMines(gridCell);
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
    $("#game-title").text("Minesweeper");
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
    //Only save games that are still in progress
    if (game.playing) {
      var data = game;

      var options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
      const response = await fetch("/api/save", options);
      const json = await response.json();
      if (json.status == "success") {
        alert("Game saved successfully");
      }
      // console.log(json);
    } else {
      alert("Cannot save completed games");
    }
  });
  //Load a game from the server
  $("#load-btn").on("click", async function () {
    // $(this).hide();
    // $("#play-btn").hide();
    var dropdown = $("#myLoadDropdown");
    //Empty previous contents
    dropdown.empty();
    //Display dropdown
    dropdown.toggleClass("show");
    fetch("/api/load")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        //console.log(typeof data);
        // console.log(data);
        const jsonData = data.GameData;
        // console.log(jsonData);
        //Fill out drop down content
        if (jsonData) {
          for (let i = 0; i < jsonData.length; i++) {
            let anchor = $("<a>").attr("href", "#").data("value", i);
            anchor.text("Game " + (i + 1));
            dropdown.append(anchor);
          }
          //Attach functionality to select the saved game represented
          // by that anchor
          $("#myLoadDropdown a").on("click", function () {
            $("#load-btn").hide();
            $("#play-btn").hide();
            $("#board").toggle();
            var clicked = $(this).data("value");
            game = new Minesweeper({}, jsonData[clicked]);
          });
        } else {
          dropdown.append(
            $("<a>").attr("href", "#").text("You have no saved Games")
          );
        }
        // console.log(data);
        //game.showBoard();
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Close the dropdown if the user clicks outside of it
  window.onclick = function (event) {
    if (!event.target.matches(".drop-load-btn")) {
      var dropdowns = document.getElementsByClassName("load-dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains("show")) {
          openDropdown.classList.remove("show");
        }
      }
    }
  };
});
