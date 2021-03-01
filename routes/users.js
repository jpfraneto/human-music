var express = require("express");
var router = express.Router();
var Recommendation = require("../models/recommendation");
var passport = require("passport");
var middleware = require("../middleware");
var User = require("../models/user");
let chiita = require("../middleware/chiita");

let today = new Date();

router.get("/:username", middleware.isLoggedIn, function(req,res){
    User.findOne({username:req.params.username}).populate("recommendations").exec(function(err, foundUser){
            if(err){
                console.log(err);
                res.redirect("/");
            } else {
                if(!foundUser){
                    res.render("users/unknown", {username:req.params.username, today: today});
                } else {
                    if(foundUser.recommendations[0]){
                        res.render("users/show", {foundUser: foundUser, today: today, recommendation:foundUser.recommendations[0]});
                    } else {
                        res.render("users/show", {foundUser: foundUser, today: today, recommendation:{}});
                    }
                }
            }
        });
});

router.get("/:username/edit", middleware.isUser, function(req, res){
    User.findOne({username:req.params.username})
    .then((foundUser)=>{
        res.render("users/edit")
    })
});

router.get("/:username/recommendations", middleware.isLoggedIn, function(req, res){
    User.findOne({"username" : req.params.username}).populate("recommendations")
    .then((foundUser) => {
        if(foundUser.recommendations.length > 0){
            let randomIndex = Math.floor(foundUser.recommendations.length * Math.random());
            let randomRecommendation = foundUser.recommendations[randomIndex]
            res.render("users/recommendations/show", {foundUser:foundUser, randomRecommendation:randomRecommendation})
        } else{
            res.render('users/notYet');
        }
    });
});

router.get("/:username/favorites", middleware.isLoggedIn, function(req, res){
    User.findOne({"username" : req.params.username}).populate("favoriteRecommendations")
    .then((foundUser) => {
        if(foundUser.favoriteRecommendations.length > 0){
            let randomIndex = Math.floor(foundUser.favoriteRecommendations.length * Math.random());
            let randomRecommendation = foundUser.favoriteRecommendations[randomIndex]
            res.render("users/favorites", {foundUser:foundUser, randomRecommendation:randomRecommendation})
        } else{
            res.render('users/notYet');
        }
    });
});

router.get("/:username/recommendations/:id", middleware.isLoggedIn, function(req,res){
    Recommendation.findById(req.params.id, function(err, foundRecommendation){
        if(err){console.log(err)}
        else{
            foundRecommendation.url = chiita.getSourceURL(foundRecommendation.url);
            res.render("users/recommendations/show", {username:req.params.username, recommendation:foundRecommendation, today: todayDay});
        }
    });
});

module.exports = router;