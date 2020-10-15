var express = require("express");
var router = express.Router();
var Recommendation = require("../models/recommendation");
var passport = require("passport");
var middleware = require("../middleware");
var User = require("../models/user");
var Comment = require("../models/comment");
let Mission = require("../models/userModels/mission");
let Idea = require("../models/userModels/idea");
let Dailie = require("../models/userModels/dailie");
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
            foundRecommendation.url = chiita.getSourceURL(foundRecommendation.url);
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

//missions routes

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

router.get("/:username/dojo/missions/:id/edit", middleware.isLoggedIn, function(req, res){
    Mission.findById(req.params.id)
    .then((foundMission)=>{
        res.render("users/dojo/missions/edit", {username:req.params.username, mission:foundMission})
    })
});

router.put("/:username/dojo/missions/:id", function(req, res){
    Mission.findById(req.params.id)
    .then((missionForUpdating) => {
        missionForUpdating.name = req.body.name;
        missionForUpdating.description = req.body.description;
        missionForUpdating.save(() => {
            console.log("The mission was updated!")
            res.redirect("/users/" + req.user.username + "/dojo/missions");
        });
    });
});

router.delete("/:username/dojo/missions/:id", function(req, res){
    Mission.findByIdAndRemove(req.params.id)
    .then((deletedMission)=>{
        console.log("The mission was deleted");
        res.redirect("/users/" + req.user.username + "/dojo/missions");
    })
});

//Ideas routes

router.get("/:username/dojo/ideas", middleware.isLoggedIn, function(req, res){
    Idea.find({username:req.params.username})
    .then((foundIdeas) => {
        res.render("users/dojo/ideas/index", {foundIdeas:foundIdeas, username:req.params.username});
    })
});

router.get("/:username/dojo/ideas/new", middleware.isLoggedIn, function(req, res){
    User.findOne({username:req.params.username})
    .then((foundUser)=>{
        res.render("users/dojo/ideas/new", {foundUser:foundUser});
    });
});

router.post("/:username/dojo/ideas", middleware.isLoggedIn, function(req, res){
    let newIdea = new Idea({
        username: req.user.username,
        date : chiita.changeDateFormat(new Date()),
        name : req.body.name,
        description : req.body.description
    })
    newIdea.save(()=> {
        console.log("The idea was saved to the DB");
        Idea.find({username:req.params.username})
        .then((foundIdeas) => {
            res.render("users/dojo/ideas/index", {foundIdeas:foundIdeas, username:req.params.username});
        })
    })
});

router.get("/:username/dojo/ideas/:id", middleware.isLoggedIn, function(req, res){
    Idea.findById(req.params.id)
    .then((foundIdea)=>{
        res.render("users/dojo/ideas/show", {username:req.params.username, idea:foundIdea})
    })
});

router.get("/:username/dojo/ideas/:id/edit", middleware.isLoggedIn, function(req, res){
    Idea.findById(req.params.id)
    .then((foundIdea)=>{
        res.render("users/dojo/ideas/edit", {username:req.params.username, idea:foundIdea})
    })
});

router.put("/:username/dojo/ideas/:id", function(req, res){
    Idea.findById(req.params.id)
    .then((ideaForUpdating) => {
        ideaForUpdating.name = req.body.name;
        ideaForUpdating.description = req.body.description;
        ideaForUpdating.save(() => {
            console.log("The idea was updated!")
            res.redirect("/users/" + req.user.username + "/dojo/ideas");
        });
    });
});

router.delete("/:username/dojo/ideas/:id", function(req, res){
    Idea.findByIdAndRemove(req.params.id)
    .then((deletedIdea)=>{
        console.log("The idea was deleted");
        res.redirect("/users/" + req.user.username + "/dojo/ideas");
    })
});


//Dailies routes


router.get("/:username/dojo/dailies", middleware.isLoggedIn, function(req, res){
    Dailie.find({username:req.params.username})
    .then((foundDailies) => {
        res.render("users/dojo/dailies/index", {foundDailies:foundDailies, username:req.params.username});
    })
});

router.get("/:username/dojo/dailies/new", middleware.isLoggedIn, function(req, res){
    User.findOne({username:req.params.username})
    .then((foundUser)=>{
        res.render("users/dojo/dailies/new", {foundUser:foundUser});
    });
});

router.post("/:username/dojo/dailies", middleware.isLoggedIn, function(req, res){
    Dailie.find({username:req.user.username})
    .then((foundDailies) => {
        let newDailie = new Dailie({
            index : foundDailies.length + 1,
            username: req.user.username,
            date : chiita.changeDateFormat(new Date()),
            name : req.body.name,
            description : req.body.description
        })
        newDailie.save(()=> {
            console.log("The dailie was saved to the DB");
            Dailie.find({username:req.params.username})
            .then((foundDailies) => {
                res.render("users/dojo/dailies/index", {foundDailies:foundDailies, username:req.params.username});
            })
        })
    })
});

router.get("/:username/dojo/dailies/:index", middleware.isLoggedIn, function(req, res){
    Dailie.findOne({index: req.params.index})
    .then((foundDailie)=>{
        res.render("users/dojo/dailies/show", {username:req.params.username, dailie:foundDailie})
    })
});

router.get("/:username/dojo/dailies/:id/edit", middleware.isLoggedIn, function(req, res){
    Dailie.findById(req.params.id)
    .then((foundDailie)=>{
        res.render("users/dojo/dailies/edit", {username:req.params.username, dailie:foundDailie})
    })
});

router.put("/:username/dojo/dailies/:id", function(req, res){
    Dailie.findById(req.params.id)
    .then((dailieForUpdating) => {
        dailieForUpdating.name = req.body.name;
        dailieForUpdating.description = req.body.description;
        dailieForUpdating.save(() => {
            console.log("The dailie was updated!")
            res.redirect("/users/" + req.user.username + "/dojo/dailies");
        });
    });
});

router.delete("/:username/dojo/dailies/:id", function(req, res){
    Dailie.findByIdAndRemove(req.params.id)
    .then((deletedDailie)=>{
        console.log("The dailie was deleted");
        res.redirect("/users/" + req.user.username + "/dojo/dailies");
    })
});


module.exports = router;