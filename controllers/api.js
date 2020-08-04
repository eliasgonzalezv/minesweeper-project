const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PSW,
  database: process.env.DB_NAME,
});

exports.save = async (req, res) => {
  // When saving, check the cookies and verify the user,
  // get the id of the user and do a insert query to
  // the save game table

  if (req.cookies.jwt) {
    //Verify token and extract the user
    const savedGame = req.body;
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      db.query(
        "INSERT INTO game SET ?",
        {
          userID: decoded.id,
          gameData: JSON.stringify(savedGame),
        },
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            // console.log(results);
            console.log("Inserted " + results.affectedRows + " row");
            //Return a flash message that
            // lets the user know the game was saved into the DB
            return res.json({
              status: "success",
              savedData: { savedGame },
            });
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
};

exports.load = async (req, res) => {
  // When loading, check the cookies and get the id of the user,
  // grab a game from the saved game table for that user and send
  // the json file back to the front end where it gets handled.
  // Eventually I'd like to send a max of 5 games back
  // to the front end as an array of json files
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //Get the JSON data from the DB
      db.query(
        "SELECT gameData FROM game WHERE userID = ? ORDER BY gameID DESC LIMIT 1",
        decoded.id,
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            // console.log(results);

            let gameData = results[0].gameData;

            // console.log(gameData);

            //Send data to front end
            return res.json({ gameData });
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
};
