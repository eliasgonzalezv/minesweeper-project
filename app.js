const express = require("express");

const mysql = require("mysql");

const session = require("express-session");

const app = express();

const fs = require("fs");

var savedGame;

// // Create the database connection
// const con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "EG@23565056",
//   database: "cs355",
// });

// con.connect(function (err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

app.use(express.static("public"));

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile("public/index.html");
});

//Todo: Add routes for all pages in the project

app.post("/api", (req, res) => {
  console.log(req.body);
  const data = req.body;
  res.json({
    status: "success",
    saveData: { data },
  });

  fs.writeFile("savedGame.json", JSON.stringify(data), function (err) {
    if (err) return console.log(err);
    console.log("Wrote the saved game file");
  });
});

app.get("/load", (req, res) => {
  let rawdata = fs.readFileSync("savedGame.json");
  savedGame = JSON.parse(rawdata);
  //console.log(savedGame);
  res.json({ savedGame });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
