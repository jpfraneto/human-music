var express = require("express");
var router = express.Router();
var Recommendation = require("../models/recommendation");
var passport = require("passport");
var middleware = require("../middleware");
var User = require("../models/user");
var Comment = require("../models/comment");
let Mission = require("../models/userModels/mission");
let theSource = require("../middleware/theSource");
let chiita = require("../middleware/chiita");

router.get("/:username", middleware.isLoggedIn, function(req,res){
    User.findOne({username:req.params.username}).populate("recommendations").exec(function(err, foundUser){
            if(err){
                console.log(err);
                res.redirect("/");
            } else {
                if(!foundUser){
                    res.render("users/unknown", {username:req.params.username});
                } else {
                    if(foundUser.recommendations[0]){
                        res.render("users/show", {foundUser: foundUser, recommendation:foundUser.recommendations[0]});
                    } else {
                        res.render("users/show", {foundUser: foundUser, recommendation:{}});
                    }
                }
            }
        });
});

router.get("/:username/dojo", middleware.isLoggedIn, function(req, res){
    User.findOne({username:req.params.username})
    .then((foundUser)=>{
        res.render("users/dojo/dojo", {foundUser:foundUser});
    });
});

router.get("/:username/recommendations", middleware.isLoggedIn, function(req, res){
    Recommendation.find({"author.username":req.params.username}, function(err, foundRecommendations){
        if(err){console.log(err)}
        else {
            res.render("users/recommendations/recommendations", {username:req.params.username, userRecommendations:foundRecommendations});
        }
    });
});

router.get("/:username/recommendations/:id", middleware.isLoggedIn, function(req,res){
    Recommendation.findById(req.params.id, function(err, foundRecommendation){
        if(err){console.log(err)}
        else{
            foundRecommendation.url = theSource.getSourceURL(foundRecommendation.url);
            res.render("users/recommendations/show", {username:req.params.username, recommendation:foundRecommendation});
        }
    });
});

router.get("/:username/dojo/introduction", middleware.isLoggedIn, function(req, res){
    User.findOne({username:req.params.username})
    .then((foundUser)=>{
        res.render("users/dojo/introduction", {foundUser:foundUser});
    });
});

router.get("/:username/dojo/missions", middleware.isLoggedIn, function(req, res){
    Mission.find({username:req.params.username})
    .then((foundMissions) => {
        res.render("users/dojo/missions/index", {foundMissions:foundMissions, username:req.params.username});
    })
});

router.get("/:username/dojo/missions/new", middleware.isLoggedIn, function(req, res){
    User.findOne({username:req.params.username})
    .then((foundUser)=>{
        res.render("users/dojo/missions/new", {foundUser:foundUser});
    });
});

router.post("/:username/dojo/missions", middleware.isLoggedIn, function(req, res){
    let newMission = new Mission({
        username: req.user.username,
        date : chiita.changeDateFormat(new Date()),
        isReady : false,
        name : req.body.name,
        description : req.body.description
    })
    newMission.save(()=> {
        console.log("The mission was saved to the DB");
        Mission.find({username:req.params.username})
        .then((foundMissions) => {
            res.render("users/dojo/missions/index", {foundMissions:foundMissions, username:req.params.username});
        })
    })
});

router.get("/:username/dojo/missions/:id", middleware.isLoggedIn, function(req, res){
    Mission.findById(req.params.id)
    .then((foundMission)=>{
        res.render("users/dojo/missions/show", {username:req.params.username, mission:foundMission})
    })
});

router.get("/:username/dojo/ideas", middleware.isLoggedIn, function(req, res){
    User.findOne({username:req.params.username})
    .then((foundUser)=>{
        res.render("users/dojo/ideas", {foundUser:foundUser});
    });
});

router.get("/:username/dojo/dailies", middleware.isLoggedIn, function(req, res){
    User.findOne({username:req.params.username})
    .then((foundUser)=>{
        res.render("users/dojo/dailies", {foundUser:foundUser});
    });
});

router.get("/:username/dojo/advice", middleware.isLoggedIn, function(req, res){
    User.findOne({username:req.params.username})
    .then((foundUser)=>{
        res.render("users/dojo/advice", {foundUser:foundUser});
    });
});

router.post("/:username/dojo/advice", function(req,res) {
    
})

module.exports = router;