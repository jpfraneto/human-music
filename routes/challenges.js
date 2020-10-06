let express = require("express");
let router = express.Router();
const axios = require("axios");
const moment = require("moment");
let passport = require("passport");
let Recommendation = require("../models/recommendation");
let Day = require("../models/day");
let User = require("../models/user");
let Cycle = require("../models/cycle");
let Challenge = require("../models/challenge");
let middleware = require("../middleware");
let theSource = require("../middleware/theSource");

let today = new Date();

//INDEX - show all challenges
router.get("/", middleware.isLoggedIn, function(req,res){
    res.render("challenges");
});

//NEW - show form to create a new challenge
router.get("/new", middleware.isLoggedIn, function(req,res){
        res.render("challenges/new", {user:req.user});
    });

//CREATE - add new recommendation to db
router.post("/", middleware.isLoggedIn, function(req,res){
    let now = new Date();
    let challengeDate = theSource.changeDateFormat(now);
    let name = req.body.name;
    let description = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username,
        country: req.user.country
    }
    let challengeDuration = req.body.challengeDuration;
    let newChallenge = new Challenge({
        author: author,
        name: name,
        description: description,
        challengeDate: challengeDate,
        challengeDuration: challengeDuration
    });
    newChallenge.save(console.log("A new challenge was created!"));
    res.redirect("/future");
});

module.exports = router;