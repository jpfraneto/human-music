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
let chiita = require("../middleware/chiita");

var today = new Date();

//CREATE - add new recommendation to db
router.post("/", middleware.isLoggedIn, function(req,res){
    Recommendation.find({}, function(err, allRecommendations){
        if(err){
            console.log(err);
        } else {
            var recommendationDate = chiita.changeDateFormat(today);
            var author = {
                id: req.user._id,
                username: req.user.username,
                country: req.user.country
            };
            var desc = req.body.description;
            if(req.body.wasCreatedByUser){
                var wasCreatedByUser = req.body.wasCreatedByUser;
            } else {
                var wasCreatedByUser = false;
            }
            let url = req.body.url;
            let type = req.body.typeOfRecommendation;
            let videoID = chiita.youtube_parser(url);
            let apiKey = process.env.YOUTUBE_APIKEY;
            let getRequestURL = "https://www.googleapis.com/youtube/v3/videos?id="+videoID+"&key="+apiKey+"&fields=items(id,snippet(title),statistics,%20contentDetails(duration))&part=snippet,statistics,%20contentDetails";
            axios.get(getRequestURL)
            .then(function(response){
                let durationISO = response.data.items[0].contentDetails.duration;
                name = response.data.items[0].snippet.title;
                duration = (moment.duration(durationISO, moment.ISO_8601)).asMilliseconds();
                if (response.data.items.length > 0){
                    let newRecommendation = {author:author, name:name, type:type, recommendationDate:recommendationDate, description:desc, author:author, 
                        url:url, status:"future", wasCreatedByUser:wasCreatedByUser, duration:duration };
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
    let formatedDate = chiita.changeDateFormat(today);
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
    Recommendation.findById(req.params.id)
    .then((foundRecommendation) => {
        res.render("recommendations/show", {recommendation : foundRecommendation});
    })
    .catch(()=>{
        console.log("The process crashed while getting the recommendation")
    })
});

// EDIT recommendation ROUTE
router.get("/:id/edit", function(req, res){
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