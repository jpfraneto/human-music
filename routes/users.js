var express = require("express");
var router = express.Router();
var Recommendation = require("../models/recommendation");
var passport = require("passport");
var middleware = require("../middleware");
var User = require("../models/user");
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

router.get("/:username/edit", function(req, res){
    User.findOne(req.params.username)
    .then((foundUser)=>{
        res.render("users/edit", {user:foundUser})
    })
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

module.exports = router;