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

//NEW - show form to create a new recommendation
router.get("/new", function(req,res){
    let formatedDate = chiita.changeDateFormat(today);
    if (req.user){
        res.render("recommendations/new", {user:req.user, today:formatedDate});
    } else {
        res.render("recommendations/new", {user: undefined, today:formatedDate});
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
        res.render("recommendations/show", {recommendation : foundRecommendation});
    })
    .catch(()=>{
        console.log("The process crashed while getting the recommendation")
    })
});

// EDIT recommendation ROUTE
router.get("/:id/edit", middleware.checkRecommendationOwnership, function(req, res){
    Recommendation.findById(req.params.id, function(err, foundRecommendation){
        if(foundRecommendation.status === "future"){
            res.render("recommendations/edit", {recommendation: foundRecommendation, user:req.user});
        } else {
            console.log("You can't edit a recommendation that is not in the future. It is already carved in stone.");
            res.redirect("/");
        }
        });
});

// UPDATE recommendation ROUTE
router.put("/:id", function(req, res){
    Recommendation.findById(req.params.id)
    .then((recommendationForUpdate) => {
        recommendationForUpdate.description = req.body.description;

        let videoID = chiita.youtube_parser(req.body.url);
        let apiKey = process.env.YOUTUBE_APIKEY;
        let getRequestURL = "https://www.googleapis.com/youtube/v3/videos?id="+videoID+"&key="+apiKey+"&fields=items(id,snippet(title),statistics,%20contentDetails(duration))&part=snippet,statistics,%20contentDetails";
        axios.get(getRequestURL)
        .then(function(response){
            let durationISO = response.data.items[0].contentDetails.duration;
            name = response.data.items[0].snippet.title;
            duration = (moment.duration(durationISO, moment.ISO_8601)).asMilliseconds();
            if (response.data.items.length > 0){
                recommendationForUpdate.name = name;
                recommendationForUpdate.duration = duration;        
                recommendationForUpdate.save(()=> {
                    console.log("The recommendation was updated");
                    res.redirect("/users/"+ req.user.username +"/recommendations");
                });
            } else {
                console.log("The video does not exist");
                res.redirect("/users/"+ req.user.username +"/recommendations");
            }
        })
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