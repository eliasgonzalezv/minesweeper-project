const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const mysql = require("mysql");
const hbs = require("hbs");
const port = process.env.PORT || 8080;

dotenv.config({ path: "./.env" });

hbs.registerPartials(__dirname + "/views/partials");

const app = express();

app.set("view engine", "hbs");

const publicDir = path.join(__dirname, "./public");

app.use(express.static(publicDir));

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

//Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use(cookieParser());

//Support for sessions
app.use(
  session({
    secret: "secret cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: null },
  })
);

//Middleware to send flash messages
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PSW,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MYSQL Connected...");
  }
});

//Routes
app.use("/", require("./routes/pages"));
app.use("/register", require("./routes/pages"));
app.use("/api", require("./routes/api"));
app.use("/auth", require("./routes/auth"));

//Listen
app.listen(port, () => console.log("Server started on port: " + port));
