const axios = require("axios");
const moment = require("moment");
let express = require("express");
let router = express.Router();
let passport = require("passport");
let Recommendation = require("../models/recommendation");
let User = require("../models/user");
let Day = require("../models/day");
let Feedback = require("../models/feedback");
let RetreatForm = require("../models/retreatForm");
const middleware = require("../middleware");
let chiita = require("../middleware/chiita");
const middlewareObj = require("../middleware");

// Root Route
router.get("/", function(req,res){
    Recommendation.findOne({status:"present"}, function (err, presentRecommendation){
        if(err){console.log(err)}
        else {
            let now = new Date();
            let today = chiita.changeDateFormat(now);
            if (!presentRecommendation){
                Day.findOne({status:"present"}).populate("recommendationsOfThisDay").exec(function(err, presentDay){
                    if(err){
                        console.log(err)
                    } else {
                        if(presentDay.elapsedRecommendations < presentDay.totalRecommendationsOfThisDay) {
                            axios.get("https://api.nasa.gov/planetary/apod?api_key=OMcSf5neLQv0rUKv8xebrLM63HFac79GpysEI5Yr")
                            .then((imageOfTheDay) => {
                                let nextRecommendationIndex = presentDay.elapsedRecommendations;
                                let nextRecommendationStartingTimestamp = presentDay.recommendationsOfThisDay[nextRecommendationIndex].startingRecommendationTimestamp;
                                let reimainingVoidTime = nextRecommendationStartingTimestamp - (now.getTime());
                                let startingTimeOfNextRecommendation = (new Date(nextRecommendationStartingTimestamp)).toUTCString().substring(17,25);
                                res.render("theVoid", {
                                    reimainingVoidTime: reimainingVoidTime, 
                                    startingTimeOfNextRecommendation : startingTimeOfNextRecommendation,
                                    today : today,
                                    nasaInfo : imageOfTheDay.data
                                });
                            })
                            .catch(err => console.log(err))
                        } else {
                            res.render("endOfDay");
                        }  
                    }
                });
            } else {
                presentRecommendation.url = chiita.getSourceURL(presentRecommendation.url);
                let now = (new Date()).getTime();
                let elapsedTime = now - presentRecommendation.startingRecommendationTimestamp; 
                let elapsedSeconds = Math.floor(elapsedTime/1000);
                let endingTimestamp = presentRecommendation.startingRecommendationTimestamp + presentRecommendation.duration;
                let endingTime = (new Date(endingTimestamp)).toUTCString().substring(17,25);
                let isRecommendationFavorited;
                if(req.user){
                    let indexOfRecommendation = req.user.favoriteRecommendations.indexOf(presentRecommendation._id);
                    if(indexOfRecommendation === -1){
                        isRecommendationFavorited = false;
                    } else {
                        isRecommendationFavorited = true;
                    }
                    console.log("THe recommendation is favorited: " + isRecommendationFavorited);
                }
                res.render("present", {
                    elapsedSeconds:elapsedSeconds, 
                    presentRecommendation: presentRecommendation, 
                    endingTime : endingTime,
                    today : today,
                    isRecommendationFavorited : isRecommendationFavorited
                });
            }
        }
    });
});

let today = new Date();

// router.get("/isfavorited", (req, res) => {
//     console.log("The is favorited route was triggered");
//     res.hola = "Aloja!";
// })

router.post("/favorited", (req, res) => {
    Recommendation.findOne({status:"present"})
    .then((presentRecommendation) => {
        if(req.user){
        req.user.favoriteRecommendations.push(presentRecommendation);
        req.user.save(()=>{
            console.log("The recommendation was added to the user");
        });
        } else {
            console.log("There is no user logged in, we cannot save the recommendation to its profile!");
        }
    })
    .catch((error)=>{
        console.log(error)
    });
});

router.post("/unfavorited", (req, res) => {
    Recommendation.findOne({status:"present"})
    .then((presentRecommendation) => {
        if(req.user){   
            const index = req.user.favoriteRecommendations.indexOf(presentRecommendation._id);
            if( index > -1 ){
                req.user.favoriteRecommendations.splice(index,1);
            }
            req.user.save(()=>{
                console.log("Updated the user after deleting the recommendation");
            })
        } else {
            console.log("There is no user logged in!")
        }
    })
    .catch((error)=>{
        console.log(error)
    });
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

//CREATE - add new recommendation to db
router.post("/", function(req,res){
    let author;
    let type = "music";
    if(req.user){
        author = {
            id: req.user._id,
            username: req.user.username,
            country: req.user.country
        }
        if(req.user.username === "chocapec") {
            type = req.body.typeOfRecommendation;
        }
    } else {
        author = {
            username: "unknown",
            country: "unknown"
        }
    };
    if(req.body.wasCreatedByUser){
        var wasCreatedByUser = req.body.wasCreatedByUser;
    } else {
        var wasCreatedByUser = false;
    }
    
    let url, imageURL, duration, name;
    if(type === "music"){
        imageURL = undefined;
        url = req.body.url;
        let newDate = new Date();
        let videoID = chiita.youtube_parser(url);
        let apiKey = process.env.YOUTUBE_APIKEY;
        let getRequestURL = "https://www.googleapis.com/youtube/v3/videos?id="+videoID+"&key="+apiKey+"&fields=items(id,snippet(title),statistics,%20contentDetails(duration))&part=snippet,statistics,%20contentDetails";
        axios.get(getRequestURL)
        .then(function(response){
            let durationISO = response.data.items[0].contentDetails.duration;
            name = response.data.items[0].snippet.title;
            duration = (moment.duration(durationISO, moment.ISO_8601)).asMilliseconds();
            if (response.data.items.length > 0){
                newRecommendation = new Recommendation({
                    author : author,
                    name : name,
                    type : type,
                    recommendationDate : chiita.changeDateFormat(newDate),
                    url : url,
                    description : req.body.description,
                    status : "future",
                    duration : duration,
                    wasCreatedByUser : wasCreatedByUser
                });
                newRecommendation.save(()=>{
                    console.log("The new recommendation was added to the DB");
                    if(req.user){
                        req.user.recommendations.push(newRecommendation);
                        req.user.save(()=>{
                            console.log("The user was updated with the new recommendation")
                        });
                    }
                    res.redirect("/");
                });
            }
        })
        .catch(()=>{
            console.log("There was an error saving the recommendation to the database");
        });
    } else if (type === "film"){
        newRecommendation = new Recommendation({
            author : author,
            name : req.body.filmName,
            type : type,
            recommendationDate : chiita.changeDateFormat(today),
            url : undefined,
            description : req.body.description,
            status : "future",
            duration : req.body.filmDuration,
            wasCreatedByUser : wasCreatedByUser,
            imageURL : req.body.url,
        });
        newRecommendation.save(()=>{
            if(req.user){
                req.user.recommendations.push(newRecommendation);
                req.user.save(()=>{
                    console.log("The user was updated with the new recommendation")
                })
            }
            res.redirect("/");
        });
    }
});

router.get("/past", function(req,res){
    Day.find({}).populate("recommendationsOfThisDay")
    .then((foundDays) => {
        res.render("past", {days:foundDays}); 
    });
});

router.get("/future", function(req,res){
    res.render("future"); 
});

// show register form
router.get("/register", function(req, res){
    res.render("register");
});

router.get("/about", function(req, res){
   res.render("about"); 
});

router.get("/days", function(req, res){
    Day.find({status:"past"}).populate("recommendationsOfThisDay").exec(function(err, foundDays){
        if(err){
            console.log(err); 
        } else {
            res.render("days/index", {pastDays:foundDays}); 
        }
    })
 });

 router.get("/days/:daySKU", function(req, res){
    Day.findOne({daySKU : req.params.daySKU}).populate("recommendationsOfThisDay").exec(function(err, foundDay){
        if(err){
            console.log(err)
        } else {
            if(foundDay){
                res.render("days/show", {thisDay: foundDay});
            } else {
                res.redirect("/past");
            }
        }
    });
 });

 router.get("/presentday", function(req, res){
    Day.findOne({status:"present"}).populate("recommendationsOfThisDay")
    .then((foundPresentDay) => {
        if(foundPresentDay){
            res.render("presentDay", {thisDay:foundPresentDay})
        } else {
            res.redirect("/");
        }
    });
 });

 router.get("/goodbye", function(req, res){
    res.render("goodbye"); 
 });

 router.get("/random", function(req, res){
    Recommendation.find({status:"past", type:"music"})
    .then((allPastRecommendations) => {
        if(allPastRecommendations.length === 0){
            res.redirect("/")
        } else {
            let randomRecommendation = allPastRecommendations[Math.floor(Math.random() * allPastRecommendations.length)];
            randomRecommendation.url = chiita.getSourceURL(randomRecommendation.url);
            res.render("random", {randomRecommendation:randomRecommendation});
        }
    })
    .catch(()=>{
        console.log("There was an error displaying the random page")
    })
 });

 //Future routes

 router.get("/future/community", function(req, res){
    res.render("future/community"); 
 });

 router.get("/future/podcast", function(req, res){
    res.render("future/podcast"); 
 });

 router.get("/future/nextsteps", function(req, res){
    res.render("future/nextsteps"); 
 });

 router.get("/future/feedback", function(req, res){
    Feedback.find()
    .then((foundFeedbacks) => {
        res.render("feedbacks/index", {foundFeedbacks:foundFeedbacks});
    })
});

router.get("/future/feedback/new", function(req, res){
    if(req.user){
        User.findOne({username:req.user.username})
        .then((foundUser)=>{
            res.render("feedbacks/new", {foundUser:foundUser});
        });
    } else {
        res.render("feedbacks/new", {foundUser:undefined});
    }
});

router.post("/future/feedback", function(req, res){
    let author;
    if(req.user){
        author = {
            id: req.user._id,
            username: req.user.username,
            country: req.user.country
        }
    } else {
        author = {
            username: req.body.usernameInput,
            country: req.body.userCountry
        }
    };
    let newFeedback = new Feedback({
        author : author,
        messageDate : chiita.changeDateFormat(new Date()),
        message : req.body.message
    })
    newFeedback.save(() => {
        console.log("The feedback was saved to the DB");
        res.redirect("/future/feedback");
    });
});

router.get("/future/feedback/:id", function(req, res){
    Feedback.findById(req.params.id).populate("comments")
    .then((foundFeedack)=>{
        if(req.user){
            res.render("feedbacks/show", {username:req.user.username, feedback:foundFeedack})
        } else {
            res.render("feedbacks/show", {username:undefined, feedback:foundFeedack})
        }
    })
});

router.get("/future/feedback/:id/edit", middlewareObj.isChocapec, function(req, res){
    Feedback.findById(req.params.id)
    .then((foundFeedback)=>{
        res.render("feedbacks/edit", {username:req.user.username, feedback:foundFeedback})
    })
});

router.put("/future/feedback/:id", function(req, res){
    Feedback.findById(req.params.id)
    .then((feedbackForUpdating) => {
        feedbackForUpdating.message = req.body.message;
        feedbackForUpdating.save(() => {
            console.log("The feedback was updated!")
            res.redirect("/future/feedback");
        });
    });
});

router.delete("/future/feedback/:id", function(req, res){
    Feedback.findByIdAndRemove(req.params.id)
    .then((deletedFeedback)=>{
        console.log("The feedback was deleted");
        res.redirect("/future/feedback");
    })
});

//handle sign up logic
router.post("/register", function(req,res){
    let newUser = new User({name:req.body.name, email:req.body.email, username:req.body.username, country: req.body.country, language:req.body.language, bio: req.body.bio});
    User.find({username:newUser.username}, function(err,foundUser){
        if(foundUser.length === 0){
            User.register(newUser, req.body.password, function(err, user){
                if(err){
                    console.log(err)
                    return res.render("register");
                } else {
                    passport.authenticate("local")(req, res, function(){
                    req.flash("success", "Welcome to Human Music "+user.username);
                    res.redirect("/");
                    });
                }
            });
        } else {
            return res.render("register");
        }
    });
});

// show login form
router.get("/login", function(req, res){
    if(req.isAuthenticated()) {
        res.redirect("/");
    } else {
        res.render("login")
    }
});

// handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/register"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/goodbye");
});

router.get("/:anything", function(req, res) {
    res.render("nonExisting");
})


module.exports = router;