const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/", authController.isLoggedIn, (req, res) => {
  res.render("index", { user: req.user });
});

router.get("/contact", authController.isLoggedIn, (req, res) => {
  res.render("contact", { user: req.user });
});

router.get("/gameInfo", authController.isLoggedIn, (req, res) => {
  res.render("gameInfo", { user: req.user });
});

router.get("/developers", authController.isLoggedIn, (req, res) => {
  res.render("developers", { user: req.user });
});

router.get("/register", (req, res) => {
  res.render("register");
});

module.exports = router;
