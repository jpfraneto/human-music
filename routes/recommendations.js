var express = require("express");
var router = express.Router();
const axios = require("axios");
const moment = require("moment");
var passport = require("passport");
var Recommendation = require("../models/recommendation");
let Day = require("../models/day");
var User = require("../models/user");
let Cycle = require("../models/cycle");
var middleware = require("../middleware");
// var functions = require("../middleware/functions");
let theSource = require("../middleware/theSource");

var today = new Date();

//CREATE - add new recommendation to db
router.post("/", middleware.isLoggedIn, function(req,res){
    Recommendation.find({}, function(err, allRecommendations){
        if(err){
            console.log(err);
        } else {
            var recommendationDate = theSource.changeDateFormat(today);
            var author = {
                id: req.user._id,
                username: req.user.username,
                country: req.user.country
            };
            var desc = req.body.description;
            var dayID = "";
            if(req.body.wasCreatedByUser){
                var wasCreatedByUser = req.body.wasCreatedByUser;
            } else {
                var wasCreatedByUser = false;
            }
            let url = req.body.url;
            let type = req.body.typeOfRecommendation;
            let videoID = theSource.youtube_parser(url);
            let apiKey = process.env.YOUTUBE_APIKEY;
            let getRequestURL = "https://www.googleapis.com/youtube/v3/videos?id="+videoID+"&key="+apiKey+"&fields=items(id,snippet(title),statistics,%20contentDetails(duration))&part=snippet,statistics,%20contentDetails";
            axios.get(getRequestURL)
            .then(function(response){
                let durationISO = response.data.items[0].contentDetails.duration;
                name = response.data.items[0].snippet.title;
                duration = (moment.duration(durationISO, moment.ISO_8601)).asMilliseconds();
                if (response.data.items.length > 0){
                    let newRecommendation = {author:author, name:name, type:type, recommendationDate:recommendationDate, description:desc, author:author, 
                        dayID:dayID, url:url, status:"future", wasCreatedByUser:wasCreatedByUser, duration:duration };
                    // create a new recommendation and save to DB
                    Recommendation.create(newRecommendation,function(err, newlyCreated){
                        if(err){
                            console.log(err);
                        } else {
                            User.findByIdAndUpdate(
                                { _id : req.user._id} , 
                                { $push: {recommendations: newlyCreated}},
                                function(err, success){
                                    if(err){
                                        console.log(err);
                                    } else {
                                        res.redirect("/");
                                    }
                                });
                        }
                    });
                } else {
                    console.log("The video doesn't exist")
                }
            });
        }
    });
});

//NEW - show form to create a new recommendation
router.get("/new", middleware.isLoggedIn, function(req,res){
// router.get("/new", function(req,res){
    let formatedDate = theSource.changeDateFormat(today);
    res.render("recommendations/new", {user:req.user, today:formatedDate});
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
router.get("/:id", middleware.isLoggedIn, function(req,res){
    // find the recommendation with the provided id
    Recommendation.findById(req.params.id).populate("comments").exec(function(err, foundRecommendation){
        if(err || !foundRecommendation){
            req.flash("error", "recommendation not found");
            res.redirect("back");
        } else {
            // render show template with that recommendation
            if(foundRecommendation.status === "future" && "a" === "the user doesn't match") {
                res.render("recommendations/edit", {recommendation: foundRecommendation});
            } else if (foundRecommendation.status === "present"){
                res.redirect("/recommendations");
            } else {
                res.render("recommendations/show", {recommendation: foundRecommendation});
            }
        }
    });
});

// EDIT recommendation ROUTE
router.get("/:id/edit", middleware.checkRecommendationOwnership, function(req, res){
    Recommendation.findById(req.params.id, function(err, foundRecommendation){
        if(foundRecommendation.status === "future"){
            res.render("recommendations/edit", {recommendation: foundRecommendation});
        } else {
            console.log("You can't edit a recommendation that already went through!");
            res.redirect("/recommendations");
        }
        });
});

// UPDATE recommendation ROUTE
router.put("/:id", middleware.checkRecommendationOwnership, function(req, res){
    // find and update the correct recommendation
    Recommendation.findByIdAndUpdate(req.params.id, req.body.recommendation, function(err, updatedRecommendation){
        if(err){
            res.redirect("/recommendations");
        } else {
            //redirect somewhere (show page)
            res.redirect("/recommendations");
        }
    });
});


// DESTROY recommendation ROUTE
router.delete("/:id", middleware.checkRecommendationOwnership, function(req,res){
    Recommendation.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/recommendations");
        } else {
            res.redirect("/recommendations");
        }
    });
});


module.exports = router;