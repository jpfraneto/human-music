const axios = require("axios");
const moment = require("moment");
let express = require("express");
let router = express.Router();
let passport = require("passport");
let Recommendation = require("../models/recommendation");
let User = require("../models/user");
let Cycle = require("../models/cycle");
const middleware = require("../middleware");
let chiita = require("../middleware/chiita");
let theSource = require("../middleware/theSource");
const middlewareObj = require("../middleware");

let today = new Date();
// Root Route
router.get("/", (req, res) => {
    Recommendation.findOne({status:"present"}).exec()
    .then((presentRecommendation) => {
        let now = (new Date).getTime();
        if (presentRecommendation) {
            let elapsedTime = now - presentRecommendation.startingRecommendationTimestamp;
            let elapsedSeconds = Math.floor(elapsedTime/1000);
            let endingTime = (new Date(presentRecommendation.endingRecommendationTimestamp)).toUTCString().substring(17,25)
            res.render("eternity", {
                youtubeID : presentRecommendation.youtubeID,
                elapsedSeconds : elapsedSeconds, 
                presentRecommendation: presentRecommendation,
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
    let author;
    newRecommendation.type = "music";
    if(req.user){
        newRecommendation.author = {
            id: req.user._id,
            username: req.user.username,
            country: req.user.country
        }
    } else {
        newRecommendation.author = {
            username: req.body.username,
            country: req.body.country
        }
    };
    if(req.body.wasCreatedByUser){
        newRecommendation.wasCreatedByUser = req.body.wasCreatedByUser;
    } else {
        newRecommendation.wasCreatedByUser = false;
    }
    let url, duration, name;
    newRecommendation.url = req.body.url;
    let videoID = chiita.getYoutubeID(newRecommendation.url);
    newRecommendation.youtubeID = videoID;
    let apiKey = process.env.YOUTUBE_APIKEY;
    let getRequestURL = "https://www.googleapis.com/youtube/v3/videos?id="+videoID+"&key="+apiKey+"&fields=items(id,snippet(title),statistics,%20contentDetails(duration))&part=snippet,statistics,%20contentDetails";
    axios.get(getRequestURL)
    .then(function(response){
        if (response.data.items.length > 0){
            let durationISO = response.data.items[0].contentDetails.duration;
            newRecommendation.name = response.data.items[0].snippet.title;
            newRecommendation.duration = (moment.duration(durationISO, moment.ISO_8601)).asMilliseconds();
            newRecommendation.recommendationDate = new Date();
            newRecommendation.description = req.body.description;
            newRecommendation.language = req.body.language;
            newRecommendation.status = "future";
            newRecommendation.type = "music";
            newRecommendation.save(()=>{
                if(req.user){
                    req.user.recommendations.push(newRecommendation);
                    req.user.save(()=>{
                        console.log("The user was updated with the new recommendation")
                    });
                }
                console.log("A new recommendation was saved by " + newRecommendation.author.username + ", with the following youtube ID: " + newRecommendation.youtubeID)
                res.redirect("/");
            });
        } else {
            console.log("There was an error retrieving the recommendation information");
            res.redirect("/");
        }
    })
    .catch(()=>{
        console.log("There was an error calling the youtube API from the database");
        res.redirect("/");
    });
});

router.post("/nextRecommendationQuery", (req,res) => {
    let answer = {};
    if (req.body.systemStatus === "present") {
        Recommendation.findOne({status:"present"}).exec()
        .then((nextPresentRecommendation)=>{
            answer.recommendation = nextPresentRecommendation;
            if (req.user) {
                if (req.user.favoriteRecommendations) {
                    let indexOfRecommendation = req.user.favoriteRecommendations.indexOf(nextPresentRecommendation._id);
                    if (indexOfRecommendation === -1) {
                        answer.isFavorited = false;
                    } else {
                        answer.isFavorited = true;
                    }
                } else {
                    answer.isFavorited = false;
                }
            } else {
                answer.isFavorited = undefined;
            }
            res.json(answer);
        })
    } else {
        Recommendation.findOne({youtubeID:req.body.videoID}).exec()
        .then((queriedVideo) => { 
            Recommendation.findOne({index: queriedVideo.index+1}).exec()
            .then((nextVideo)=>{
                if (nextVideo) {
                    answer.recommendation = nextVideo;
                    if (req.user) {
                        if (req.user.favoriteRecommendations) {
                            let indexOfRecommendation = req.user.favoriteRecommendations.indexOf(nextVideo._id);
                            if (indexOfRecommendation === -1) {
                                answer.isFavorited = false;
                            } else {
                                answer.isFavorited = true;
                            }
                        } else {
                            answer.isFavorited = false;
                        }
                    } else {
                        answer.isFavorited = undefined;
                    }
                    res.json(answer);
                }
            })
        })   
    }
})

router.get("/getUserInfo", (req, res) => {
    if(req.user){
        res.send({username:req.user.username, country:req.user.country, language:req.user.language})
    }
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
    console.log(req.body);
    Recommendation.findOne({youtubeID:req.body.recommendationID}).exec()
    .then((queriedRecommendation)=>{
        answer.recommendation = queriedRecommendation;
        if (req.user) {
            if (req.user.favoriteRecommendations) {
                let indexOfRecommendation = req.user.favoriteRecommendations.indexOf(queriedRecommendation._id);
                if (indexOfRecommendation === -1) {
                    answer.isFavorited = false;
                } else {
                    answer.isFavorited = true;
                }
            } else {
                answer.isFavorited = false;
            }
        } else {
            answer.isFavorited = undefined;
        }
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

router.get("/mobile", (req, res) => {
    res.render("mobile");
});

router.post("/favorited", (req, res) => {
    let answer = {};
    if (req.user){
        Recommendation.findOne({youtubeID:req.body.recommendationID}).exec()
        .then((thisRecommendation)=>{
            req.user.favoriteRecommendations.push(thisRecommendation);
            req.user.save(()=>{
                console.log("The recommendation was added to the user")
            });
        })
        answer.user = req.user;
        res.json(answer);
    } else {
        answer.user = undefined;
        res.json(answer);
    }
});

router.post("/unfavorited", (req, res) => {
    let answer = {};
    if (req.user){
        Recommendation.findOne({youtubeID:req.body.recommendationID}).exec()
        .then((thisRecommendation)=>{
            const index = req.user.favoriteRecommendations.indexOf(thisRecommendation._id);
            if( index > -1 ){
                req.user.favoriteRecommendations.splice(index,1);
            } else {
                console.log("The recommendation was not in the user's profile")
            }
            req.user.save(()=>{
                console.log("Updated the user after deleting the recommendation " + thisRecommendation.name);
            })
        })
        answer.user = req.user;
        res.json(answer);
    } else {
        answer.user = undefined;
        res.json(answer);
    }
});

router.post("/checkIfRepeated", (req, res) => {
    let videoID = req.body.videoID
    let response = {
        isRepeated : false,
    }
    Recommendation.find({type:"music"})
    .then((foundRecommendations)=>{
        foundRecommendations.forEach((recommendation)=>{
            if(videoID === recommendation.url.slice(-11)){
                response.isRepeated = true;
                response.author = recommendation.author
            }
        })
        res.json(response)
    })
    .catch(err => console.log("There was an error!"))
});

router.get("/getFavoriteRecommendations", (req, res) => {
    User.findOne({"username" : req.user.username}).populate("favoriteRecommendations")
    .then((foundUser) => {
        res.json(foundUser.favoriteRecommendations)
    });
})

// show register form
router.get("/register", function(req, res){
    res.render("register", {today: today});
});

router.get("/about", function(req, res){
   res.render("about", {today: today}); 
});

//handle sign up logic
router.post("/register", function(req,res){
    let newUser = new User({name:req.body.name, email:req.body.email, username:req.body.username, country: req.body.country, language:req.body.language});
    User.find({username:newUser.username}, function(err,foundUser){
        if(foundUser.length === 0){
            User.register(newUser, req.body.password, function(err, user){
                if(err){
                    console.log(err)
                    return res.render("register", {today: today});
                } else {
                    passport.authenticate("local")(req, res, function(){
                    req.flash("success", "Welcome to Human Music "+user.username);
                    res.redirect("/");
                    });
                }
            });
        } else {
            return res.render("register", {today: today});
        }
    });
});

// show login form
router.get("/login", function(req, res){
    if(req.isAuthenticated()) {
        res.redirect("/");
    } else {
        res.render("login", {today: today})
    }
});

router.get("/loginFailure", function(req,res){
    res.render("loginFailure", {today: today});
})

// handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/loginFailure"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
});

router.get("/:anything", function(req, res) {
    res.render("nonExisting", {today: today});
})


module.exports = router;