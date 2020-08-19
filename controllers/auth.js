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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      //Send a flash message
      req.session.message = {
        message: "Please provide an email and password",
      };
      res.redirect("/");
    }

    db.query(
      "SELECT * FROM UserInfo WHERE UserEmail = ?",
      [email],
      async (err, results) => {
        // console.log(results);
        if (
          results.length < 1 ||
          !(await bcrypt.compare(password, results[0].UserPassword))
        ) {
          req.session.message = { message: "Incorrect email or password" };
          res.redirect("/");
        } else {
          const id = results[0].UserID;
          //Set up jwt token
          const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });

          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };

          res.cookie("jwt", token, cookieOptions);
          res.redirect("/");
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.register = (req, res) => {
  //For testing purposes
  // console.log(req.body);

  const { name, email, password, pswConfirm } = req.body;

  //Check if user already exist in db
  db.query(
    "SELECT UserEmail FROM UserInfo WHERE UserEmail = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.log(err); //For testing purposes
      }

      if (results.length > 0) {
        //There is an user already in db
        return res.render("register", {
          message: "Email is already in use",
        });
      }
      //Check if passwords match.
      else if (password !== pswConfirm) {
        return res.render("register", {
          message: "Passwords do not match",
        });
      }

      //Ready to insert user
      let hashedPassword = await bcrypt.hash(password, 8);
      //For testing purposes
      // console.log(hashedPassword);

      db.query(
        "INSERT INTO UserInfo SET ?",
        {
          UserName: name,
          UserEmail: email,
          UserPassword: hashedPassword,
        },
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            return res.render("register", { message: "User registered." });
          }
        }
      );
    }
  );
};

exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.cookies);

  if (req.cookies.jwt) {
    try {
      //Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // console.log(decoded);
      //Check if user still exists

      db.query(
        "SELECT * FROM UserInfo WHERE UserID = ?",
        [decoded.id],
        (error, result) => {
          // console.log(result);

          if (result.length < 1) {
            return next();
          }
          //Can be used to check user is logged in
          // req.loggedIn = true;
          //Grab the user
          req.user = result[0];
          return next();
        }
      );
    } catch (error) {
      // console.log(error);
      return next();
    }
  } else {
    //Allows to move on with execution of code where this
    // loggedin function is called
    next();
  }
};

//Allows user to logout
exports.logout = async (req, res) => {
  //Overwrite previous cookie with a cookie
  //that expires after 2 seconds
  res.cookie("jwt", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
  });
  res.redirect("/");
};
