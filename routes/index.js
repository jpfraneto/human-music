const axios = require("axios");
const moment = require("moment");
let express = require("express");
let router = express.Router();
let Recommendation = require("../models/recommendation");
let PodcastEmail = require("../models/podcast");
let Cycle = require("../models/cycle");
let theSource = require("../middleware/theSource");

let today = new Date();
// Root Route
router.get("/", (req, res) => {
    Recommendation.findOne({status:"present"}).exec()
    .then((presentRecommendation) => {
        let now = (new Date).getTime();
        if (presentRecommendation) {
            let elapsedTime = now - presentRecommendation.startingRecommendationTimestamp;
            let elapsedSeconds = Math.floor(elapsedTime/1000);
            res.render("eternity", {
                youtubeID : presentRecommendation.youtubeID,
                elapsedSeconds : elapsedSeconds, 
                presentRecommendation: {
                    name: presentRecommendation.name,
                    recommenderName : presentRecommendation.author.name || presentRecommendation.author.username,
                    country : presentRecommendation.author.country,
                    description : presentRecommendation.description
                },
            })
        } else {
            console.log("There was not a recommendation in the present. The check system function will run now");
            theSource.checkSystem();
            res.render("error");
        }
    })
})

//CREATE - add new recommendation to db
router.post("/", function(req,res){
    let newRecommendation = new Recommendation();
    newRecommendation.author = {
        name: req.body.name,
        country: req.body.country,
        email: req.body.email,
    }
    newRecommendation.description = req.body.description;
    newRecommendation.language = req.body.language;
    newRecommendation.status = "future";
    newRecommendation.type = "music";
    newRecommendation.reviewed = false;
    newRecommendation.recommendationDate = new Date();
    let url, duration, name;
    newRecommendation.youtubeID = req.body.newRecommendationID;
    let apiKey = process.env.YOUTUBE_APIKEY;
    let getRequestURL = "https://www.googleapis.com/youtube/v3/videos?id="+newRecommendation.youtubeID+"&key="+apiKey+"&fields=items(id,snippet(title),statistics,%20contentDetails(duration))&part=snippet,statistics,%20contentDetails";
    axios.get(getRequestURL)
    .then(function(response){
        if (response.data.items.length > 0){
            let durationISO = response.data.items[0].contentDetails.duration;
            newRecommendation.name = response.data.items[0].snippet.title;
            newRecommendation.duration = (moment.duration(durationISO, moment.ISO_8601)).asMilliseconds();
            newRecommendation.save(()=>{
                console.log("A new recommendation was saved by " + newRecommendation.author.name + ", with the following youtube ID: " + newRecommendation.youtubeID)
                res.json({answer:"The recommendation " + newRecommendation.name + " was added successfully to the future! Thanks "+ newRecommendation.author.name +" for your support." })
            });
        } else {
            res.json({answer: "There was an error retrieving the recommendation from youtube. Please try again later, sorry for all the trouble that this means"})
        }
    })
    .catch(()=>{
        res.json({answer: "There was an error retrieving the recommendation from youtube. Please try again later, sorry for all the trouble that this means"})
    });
});

router.get("/podcast", (req, res)=>{
    res.render("podcast")
});

router.post("/podcast", (req, res)=>{
    let podcastEmail = new PodcastEmail({email:req.body.podcastEmail});
    podcastEmail.save(()=>{
        res.redirect("/")
    })
})

router.post("/nextRecommendationQuery", (req,res) => {
    let answer = {};
    if (req.body.systemStatus === "present") {
        Recommendation.findOne({status:"present"}).exec()
        .then((nextPresentRecommendation)=>{
            answer.recommendation = nextPresentRecommendation;
            let elapsedSeconds = 0;
            res.json(answer);
        })
    } else {
        Recommendation.findOne({youtubeID:req.body.videoID}).exec()
        .then((queriedVideo) => { 
            Recommendation.findOne({index: queriedVideo.index+1}).exec()
            .then((nextVideo)=>{
                if (nextVideo) {
                    answer.recommendation = nextVideo;
                    answer.elapsedSeconds = 0;
                    res.json(answer);
                }
            })
        })   
    }
})

router.get("/randomRecommendation", (req, res) => {
    Recommendation.find({status:"past"}).exec()
    .then((allPastRecommendations) =>{
        let randomIndex = Math.floor(Math.random()*allPastRecommendations.length);
        res.json({recommendation:allPastRecommendations[randomIndex]});
    })
})

router.get("/pastTimeTravel", (req, res) => { 
    let answer = {};
    let pastRecommendations = [];
    Recommendation.find({status:"past"}).exec()
    .then((allPastRecommendations) => {
        Cycle.find({}).exec()
        .then((foundCycles)=>{
            let openedCycle = foundCycles[foundCycles.length-1]
            answer.activeCycleStartingTimestamp = openedCycle.startingTimestamp;
            if(allPastRecommendations) {
                answer.pastRecommendations = allPastRecommendations;
                answer.message = "There are " + allPastRecommendations.length + " recommendations in the past and this one was chosen from there."
            } else {
                answer.pastRecommendations = [];
                answer.message = "So bad, there are no recommendations in the past."
            }
            res.json(answer);
        })
    })
})

router.post("/getRecommendationInformation", (req, res) => {
    let answer = {};
    Recommendation.findOne({youtubeID:req.body.recommendationID}).exec()
    .then((queriedRecommendation)=>{
        answer.recommendation = queriedRecommendation;
        res.json(answer);
    })
})

router.get("/getFutureRecommendations", (req, res) => { 
    let response = {futureRecommendations : []};
    let totalDuration = 0;
    Recommendation.find({status:"future"}).exec()
    .then((futureRecommendations)=>{
        futureRecommendations.forEach((recommendation)=>{
            totalDuration += recommendation.duration;
            response.futureRecommendations.push(recommendation.youtubeID);
        })
        response.futureDuration = totalDuration;
        res.json(response);
    })
})

router.post("/checkIfRepeated", (req, res) => {
    let videoID = req.body.videoID
    let response = {
        isRepeated : false,
    }
    Recommendation.findOne({youtubeID:req.body.videoID})
    .then((repeatedRecommendation)=>{
        if (repeatedRecommendation) {
            response.isRepeated = true;
            response.author = repeatedRecommendation.author
        }
        res.json(response)
    })
    .catch(err => console.log("There was an error checking if the video is repeated!"))
});

router.get("/reviewer", (req, res)=>{
    Recommendation.findOne({reviewed:false})
    .then((recommendationForReview)=>{
        if(recommendationForReview){
            res.render("reviewer", {
                youtubeID : recommendationForReview.youtubeID,
                elapsedSeconds : 0, 
                recommendation: {
                    name: recommendationForReview.name,
                    recommenderName : recommendationForReview.author.name || recommendationForReview.author.username,
                    country : recommendationForReview.author.country,
                    description : recommendationForReview.description,
                    recommendationID : recommendationForReview._id
                },
            })
        } else {
            console.log("There are not any more recommendations that need to be reviewed, you are going to be redirected to the present")
            res.redirect("/")
        }
    })
})

router.post("/reviewer", (req, res)=>{
    if (req.body.password === process.env.REVIEWER_PASS){
        Recommendation.findById(req.body.recommendationID)
        .then((foundRecommendation)=>{
            foundRecommendation.reviewed = true;
            if(req.body.reviewerRadioBtn === "true"){
                foundRecommendation.save(()=>{
                    console.log("The recommendation " + foundRecommendation.name + " was reviewed and sent to the future");
                    res.redirect("/reviewer")
                })
            } else {
                foundRecommendation.status = "void";
                foundRecommendation.save(()=>{
                    console.log("The recommendation " + foundRecommendation.name + " doesn't work and was sent to the void");
                    res.redirect("/reviewer")
                })
            }
        })
    } else {
        console.log("The password is incorrect")
        res.redirect("/reviewer")
    }
})

router.get("/error", (req, res)=>{
    res.render("error");
})

router.get("/:anything", function(req, res) {
    res.render("nonExisting", {today: today});
})

module.exports = router;