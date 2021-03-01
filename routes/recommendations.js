var express = require("express");
var router = express.Router();
const axios = require("axios");
const moment = require("moment");
var passport = require("passport");
var Recommendation = require("../models/recommendation");
var User = require("../models/user");
var middleware = require("../middleware");
let chiita = require("../middleware/chiita");

var today = new Date();

//NEW - show form to create a new recommendation
router.get("/new", middleware.isLoggedIn, function(req,res){
    if (req.user){
        res.render("recommendations/new", {user:req.user, today:today});
    } else {
        res.render("recommendations/new", {user: undefined, today:today});
    }
});

router.get("/allRecommendations", function(req, res){
    Recommendation.find({})
    .then(foundRecommendations => {
        if(foundRecommendations.length > 0 ){
            res.render("recommendations/allRecommendations", {recommendations:foundRecommendations});
        } else {
            res.redirect("/");
        }
    });
});

// EDIT recommendation ROUTE
router.get("/:id/edit", middleware.checkRecommendationOwnership, function(req, res){
    Recommendation.findById(req.params.id, function(err, foundRecommendation){
        if(foundRecommendation.status === "future"){
            res.render("recommendations/edit", {recommendation: foundRecommendation, today:today, user:req.user});
        } else {
            console.log("You can't edit a recommendation that is not in the future. It is already carved in stone.");
            res.redirect("/");
        }
        });
});

// UPDATE recommendation ROUTE
router.put("/:id", function(req, res) {
    Recommendation.findById(req.params.id)
    .then((recommendationForUpdate) => {
        recommendationForUpdate.description = req.body.description;
        recommendationForUpdate.save(()=> {
            console.log("The recommendation was updated");
            res.redirect("/users/"+ req.user.username +"/recommendations");
        });
    });
});

// DESTROY recommendation ROUTE
router.delete("/:id", function(req,res){
    Recommendation.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/users/"+ req.user.username +"/recommendations");
        } else {
            console.log("The recommendation was deleted");
            res.redirect("/users/"+ req.user.username +"/recommendations");
        }
    });
});

module.exports = router;