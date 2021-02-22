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
    newRecommendation.type = req.body.recommendationType;
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
    newRecommendation.wasCreatedByUser = req.body.wasCreatedByUser;
    newRecommendation.description = req.body.description;
    newRecommendation.language = req.body.language;
    newRecommendation.status = "future";
    newRecommendation.type = "music";
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
                console.log(newRecommendation);
                if(req.user){
                    req.user.recommendations.push(newRecommendation);
                    req.user.save(()=>{
                        console.log("The user was updated with the new recommendation")
                    });
                }
                console.log("A new recommendation was saved by " + newRecommendation.author.username + ", with the following youtube ID: " + newRecommendation.youtubeID)
                res.json({answer:"The recommendation " + newRecommendation.name + " was added successfully to the future! Thanks "+ newRecommendation.author.username +" for your support." })
            });
        } else {
            res.json({answer: "There was an error retrieving the recommendation from youtube. Please try again later, sorry for all the trouble that this means"})
        }
    })
    .catch(()=>{
        res.json({answer: "There was an error retrieving the recommendation from youtube. Please try again later, sorry for all the trouble that this means"})
    });
});

router.post("/nextRecommendationQuery", (req,res) => {
    let answer = {};
    if (req.body.systemStatus === "present") {
        Recommendation.findOne({status:"present"}).exec()
        .then((nextPresentRecommendation)=>{
            answer.recommendation = nextPresentRecommendation;
            let elapsedTime = (new Date).getTime() - nextPresentRecommendation.startingRecommendationTimestamp;
            answer.elapsedSeconds = Math.floor(elapsedTime/1000);
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

router.get("/getFavoriteRecommendations", (req, res) => {
    User.findOne({"username" : req.user.username}).populate("favoriteRecommendations")
    .then((foundUser) => {
        res.json(foundUser.favoriteRecommendations)
    });
})

router.get("/getUserRecommendations", (req, res) => {
    User.findOne({"username" : req.user.username}).populate("recommendations")
    .then((foundUser) => {
        res.json(foundUser.recommendations)
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
router.post("/register", async function (req,res, next) {
    try {
        const user = new User({name:req.body.name, email:req.body.email, username:req.body.username, country: req.body.country, language:req.body.language});
        const registeredUser = await User.register(user, req.body.password);
        console.log(registeredUser);
        req.login(registeredUser, err=>{
            if(err) return next(err);
            req.flash('success', 'Welcome to Human Music');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
});

// show login form
router.get("/login", function(req, res){
    if(req.isAuthenticated()) {
        return res.redirect("/");
    } 
    res.render("login")
});

router.get("/loginFailure", function(req,res){
    res.render("loginFailure", {today: today});
})

// handling login logic

router.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect:'/login'}), (req, res)=>{
    req.flash('success', 'welcome back');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
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