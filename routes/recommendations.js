var express = require("express");
var router = express.Router();
const axios = require("axios");
const moment = require("moment");
var passport = require("passport");
var Recommendation = require("../models/recommendation");
let Day = require("../models/day");
var User = require("../models/user");
var middleware = require("../middleware");
let chiita = require("../middleware/chiita");

var today = new Date();
let todayDay = chiita.changeDateFormat(today);

//NEW - show form to create a new recommendation
router.get("/new", function(req,res){
    let formatedDate = chiita.changeDateFormat(today);
    if (req.user){
        res.render("recommendations/new", {user:req.user, today:formatedDate});
    } else {
        res.render("recommendations/new", {user: undefined, today:formatedDate});
    }
});

router.get("/nueva", function(req,res){
    let formatedDate = chiita.changeDateFormat(today);
    if (req.user){
        res.render("recommendations/nueva", {user:req.user, today:formatedDate});
    } else {
        res.render("recommendations/nueva", {user: undefined, today:formatedDate});
    }
});


router.get("/allRecommendations", middleware.isChocapec, function(req, res){
    Recommendation.find({})
    .then(foundRecommendations => {
        if(foundRecommendations.length > 0 ){
            res.render("recommendations/allRecommendations", {recommendations:foundRecommendations});
        } else {
            res.redirect("/");
        }
    });
});

//SHOW - shows more info about one recommendation
router.get("/:id", function(req,res){
    // find the recommendation with the provided id
    Recommendation.findById(req.params.id)
    .then((foundRecommendation) => {
        res.render("recommendations/show", {recommendation : foundRecommendation, today:todayDay});
    })
    .catch(()=>{
        console.log("The process crashed while getting the recommendation")
    })
});

// EDIT recommendation ROUTE
router.get("/:id/edit", middleware.checkRecommendationOwnership, function(req, res){
    Recommendation.findById(req.params.id, function(err, foundRecommendation){
        if(foundRecommendation.status === "future"){
            res.render("recommendations/edit", {recommendation: foundRecommendation, today:todayDay, user:req.user});
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