var express = require("express");
var router = express.Router();
var Recommendation = require("../models/recommendation");
var passport = require("passport");
var middleware = require("../middleware");
var User = require("../models/user");
var Comment = require("../models/comment");
let theSource = require("../middleware/theSource");

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
                        res.render("users/show", {user: foundUser, recommendation:foundUser.recommendations[0]});
                    } else {
                        res.render("users/show", {user: foundUser, recommendation:{}});
                    }
                }
            }
        });
});

router.get("/:username/office", middleware.isLoggedIn, function(req, res){
    res.render("users/office/office", {username:req.params.username});
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

router.get("/:username/office/introduction", middleware.isLoggedIn, function(req, res){
    res.render("users/office/introduction", {username:req.params.username});
});

router.get("/:username/office/quests", middleware.isLoggedIn, function(req, res){
    res.render("users/office/quests", {username:req.params.username});
});

router.get("/:username/office/ideas", middleware.isLoggedIn, function(req, res){
    res.render("users/office/ideas", {username:req.params.username});
});

router.get("/:username/office/dailies", middleware.isLoggedIn, function(req, res){
    res.render("users/office/dailies", {username:req.params.username});
});

router.get("/:username/office/advice", middleware.isLoggedIn, function(req, res){
    res.render("users/office/advice", {username:req.params.username});
});

module.exports = router;