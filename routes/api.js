const express = require("express");

const apiController = require("../controllers/api");

const router = express.Router();

//Handle routes for loading and saving a game.

router.post("/save", apiController.save);

router.get("/load", apiController.load);

module.exports = router;
