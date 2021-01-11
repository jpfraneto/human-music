const axios = require("axios");
const moment = require("moment");
let express = require("express");
let router = express.Router();
let passport = require("passport");
let Recommendation = require("../models/recommendation");
let User = require("../models/user");
let Day = require("../models/day");
let Cycle = require("../models/cycle");
let Feedback = require("../models/feedback");
let RetreatForm = require("../models/retreatForm");
const middleware = require("../middleware");
let chiita = require("../middleware/chiita");
const middlewareObj = require("../middleware");

let today = new Date();
let todayDay = chiita.changeDateFormat(today);
// Root Route

router.get("/", (req, res) => {
    Recommendation.findOne({status:"present"})
    .then((presentRecommendation)=>{
        let now = (new Date());
        if(presentRecommendation){
            let elapsedTime = now.getTime() - presentRecommendation.startingRecommendationTimestamp; 
            let elapsedSeconds = Math.floor(elapsedTime/1000);
            let endingTimestamp = presentRecommendation.startingRecommendationTimestamp + presentRecommendation.duration;
            let endingTime = (new Date(endingTimestamp)).toUTCString().substring(17,25);
            let formattedToday = chiita.changeDateFormat(today);
            res.render("newPresent", {
                elapsedSeconds:elapsedSeconds, 
                presentRecommendation: presentRecommendation, 
                endingTime : endingTime,
                today : formattedToday,
            });
        } else {
            Day.findOne({status:"present"}).populate("recommendationsOfThisDay")
            .then((presentDay) => {
                if(presentDay){
                    if(presentDay.elapsedRecommendations < presentDay.totalRecommendationsOfThisDay) {
                        let nextRecommendationIndex = presentDay.elapsedRecommendations;
                        let nextRecommendationStartingTimestamp = presentDay.startingTimestampsOfThisDay[nextRecommendationIndex];
                        let reimainingVoidTime = nextRecommendationStartingTimestamp - (now.getTime());
                        console.log("The remaining void time is: " + reimainingVoidTime);
                        let startingTimeOfNextRecommendation = (new Date(nextRecommendationStartingTimestamp)).toUTCString().substring(17,25);
                        let imageOfTheDayData = {
                            url:  presentDay.apod.url,
                            title: presentDay.apod.title,
                            explanation : presentDay.apod.explanation
                        }
                        res.render("theVoid", {
                            reimainingVoidTime: reimainingVoidTime, 
                            startingTimeOfNextRecommendation : startingTimeOfNextRecommendation,
                            today : todayDay,
                            nasaInfo : imageOfTheDayData
                        })
                    } else {
                        res.render("endOfDay", {today:todayDay});
                    }  
                } else {
                    res.render("endOfDay", {today:todayDay});
                }
            })
        }
    })
});

router.get("/checkSystemStatus", (req,res) => {
    let answer = {};
    Day.findOne({status:"present"}).populate("recommendationsOfThisDay")
    .then((presentDay) => {
        answer.recommendation = null;
        answer.elapsedTime = 0;
        answer.isFavorited = null;
        if(presentDay){
            let now = (new Date).getTime();
            answer.systemStatus = presentDay.systemStatus;
            answer.dayStartTimestamp = presentDay.startingDayTimestamp;
            if(presentDay.systemStatus === "film" || presentDay.systemStatus === "recommendation"){
                let presentRecommendation = presentDay.recommendationsOfThisDay[presentDay.elapsedRecommendations];
                let finishingTimestamp = presentRecommendation.startingRecommendationTimestamp + presentRecommendation.duration;
                answer.recommendation = presentRecommendation;
                answer.nextEventStartingTimestamp = finishingTimestamp;
                answer.elapsedTime = Math.floor((now - presentRecommendation.startingRecommendationTimestamp))/1000;
                if(req.user){
                    let indexOfRecommendation = req.user.favoriteRecommendations.indexOf(presentRecommendation._id);
                    if(indexOfRecommendation === -1){
                        answer.isFavorited = false;
                    } else {
                        answer.isFavorited = true;
                    }
                }
            } else if (presentDay.systemStatus === "void") {   
                answer.nextEventStartingTimestamp = presentDay.startingTimestampsOfThisDay[presentDay.elapsedRecommendations];
            } else if (presentDay.systemStatus === "endOfDay") {
                answer.nextEventStartingTimestamp = presentDay.startingDayTimestamp + 86400000;
            } 
        } else {
            answer.systemStatus = "endOfDay";
            answer.nextEventStartingTimestamp = undefined;
        }
        res.json(answer);
    })
    // .catch(()=>{console.log("There was an error getting the present day")})
});

router.post("/addRecommendation", (req,res) => {
    console.log(req.body);
    res.json({123:345})
})

router.post("/showRecommendation", (req,res) => {
    let answer = {};
    Recommendation.findById(req.body.recommendationID)
    .then((foundRecommendation)=>{
        if(req.user){
            if(req.user.favoriteRecommendations){
                let indexOfRecommendation = req.user.favoriteRecommendations.indexOf(foundRecommendation._id);
                if(indexOfRecommendation === -1){
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
    .catch(()=>{console.log("There was an error in the showRecommendation route")})
});


router.post("/getRecommendation", (req,res) => {
    Recommendation.findOne({status:"present"})
    .then((presentRecommendation)=>{
        res.json(presentRecommendation);
    })
});

router.get("/mobile", (req, res) => {
    res.render("mobile");
});

router.post("/favorited", (req, res) => {
    if(req.body.recommendationID){
        Recommendation.findById(req.body.recommendationID)
        .then((recommendation)=>{
            req.user.favoriteRecommendations.push(recommendation);
            req.user.save(()=>{
                console.log("The recommendation was added to the user")
            })
        })
        .catch((error)=>{
            console.log(error)
        });    
    } else {
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
            console.log(error);
        });
    }
});

router.post("/unfavorited", (req, res) => {
    if (req.body.recommendationID){
        Recommendation.findById(req.body.recommendationID)
        .then((recommendation)=> {
            const index = req.user.favoriteRecommendations.indexOf(recommendation._id);
            if( index > -1 ){
                req.user.favoriteRecommendations.splice(index,1);
            }
            req.user.save(()=>{
                console.log("Updated the user after deleting the recommendation");
            })
        })
        .catch((error)=>{
            console.log(error)
        });
    } else {
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
    } else {
        author = {
            username: req.body.username,
            country: req.body.country
        }
    };
    if(req.body.wasCreatedByUser){
        var wasCreatedByUser = req.body.wasCreatedByUser;
    } else {
        var wasCreatedByUser = false;
    }
    let url, duration, name;
    url = req.body.url;
    let newDate = new Date();
    let videoID = chiita.getYoutubeID(url);
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
                youtubeID : videoID,
                url : url,
                description : req.body.description,
                status : "ether",
                duration : duration,
                wasCreatedByUser : wasCreatedByUser
            });
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
        }
    })
    .catch(()=>{
        console.log("There was an error calling the youtube API from the database");
    });
});

router.get("/past", function(req,res){
    Day.find({cycleStatus:"active"}).populate("recommendationsOfThisDay")
    .then((foundActiveDays) => {
        let todayDay = chiita.changeDateFormat(today);
        Cycle.find({})
        .then((foundCycles)=>{
            res.render("past2", {days:foundActiveDays, today:todayDay, cycles:foundCycles}); 
        })
    });
});

router.get("/future", function(req,res){
    res.render("future2", {today: todayDay}); 
});

// show register form
router.get("/register", function(req, res){
    res.render("register", {today: todayDay});
});

router.get("/about", function(req, res){
   let todayDay = chiita.changeDateFormat(today);
   res.render("about", {today: todayDay}); 
});

router.get("/welcome", function(req, res){
    let todayDay = chiita.changeDateFormat(today);
    res.render("welcome", {today: todayDay}); 
 });

 router.get("/bienvenida", function(req, res){
    let todayDay = chiita.changeDateFormat(today);
    res.render("bienvenida", {today: todayDay}); 
 });



router.get("/days", function(req, res){
    Day.find({status:"past"}).populate("recommendationsOfThisDay").exec(function(err, foundDays){
        if(err){
            console.log(err); 
        } else {
            res.render("days/index", {pastDays:foundDays, today: todayDay}); 
        }
    })
 });

 router.get("/days/:daySKU", function(req, res){
    Day.findOne({daySKU : req.params.daySKU}).populate("recommendationsOfThisDay").exec(function(err, foundDay){
        if(err){
            console.log(err)
        } else {
            if(foundDay){
                res.render("days/show", {thisDay: foundDay, today: todayDay});
            } else {
                res.redirect("/past");
            }
        }
    });
 });

 router.get("/cycles/:cycleIndex", function(req,res){
    Cycle.findOne({cycleIndex: req.params.cycleIndex}).populate("daysOfThisCycle")
    .then((foundCycle)=>{
        res.render("cycles/show", {cycle:foundCycle, today:todayDay})
    })
 })

 router.get("/presentday", function(req, res){
    Day.findOne({status:"present"}).populate("recommendationsOfThisDay")
    .then((foundPresentDay) => {
        if(foundPresentDay){
            res.render("presentDay", {thisDay:foundPresentDay, today: todayDay})
        } else {
            res.redirect("/");
        }
    });
 });

 router.get("/goodbye", function(req, res){
    res.render("goodbye", {today: todayDay}); 
 });

 router.get("/random", function(req, res){
    Recommendation.find({status:"past", type:"music"})
    .then((allPastRecommendations) => {
        if(allPastRecommendations.length === 0){
            res.redirect("/")
        } else {
            let randomRecommendation = allPastRecommendations[Math.floor(Math.random() * allPastRecommendations.length)];
            res.redirect("/recommendations/" + randomRecommendation._id)
        }
    })
    .catch(()=>{
        console.log("There was an error displaying the random page")
    })
 });

 router.get("/reviewer", function(req, res){
    Recommendation.findOne({status : "ether"})
    .then((notReviewedRecommendation) => {
         res.render("reviewer", {recommendation:notReviewedRecommendation, today: todayDay})
    })
    .catch(()=>{
        console.log("There was an error displaying the reviewed page")
    })
 });

router.post("/reviewer", function(req,res){
    Recommendation.findById(req.body.recommendationID)
    .then((foundRecommendation)=>{
        foundRecommendation.status = req.body.status;
        foundRecommendation.save(()=>{
            console.log("The recommendation's status was updated to: " + foundRecommendation.status)
            res.redirect("/reviewer");
        })
    })
})
 
 //Future routes

 router.get("/future/community", function(req, res){
    res.render("future/community", {today: todayDay}); 
 });

 router.get("/future/eclipse", function(req, res){
    res.render("future/eclipse", {today: todayDay}); 
 });

 router.get("/future/podcast", function(req, res){
    res.render("future/podcast", {today: todayDay}); 
 });

 router.get("/future/nextsteps", function(req, res){
    res.render("future/nextsteps", {today: todayDay}); 
 });

 router.get("/future/feedback", function(req, res){
    Feedback.find()
    .then((foundFeedbacks) => {
        res.render("feedbacks/index", {foundFeedbacks:foundFeedbacks, today: todayDay});
    })
});

router.get("/future/feedback/new", function(req, res){
    if(req.user){
        User.findOne({username:req.user.username})
        .then((foundUser)=>{
            res.render("feedbacks/new", {foundUser:foundUser, today: todayDay});
        });
    } else {
        res.render("feedbacks/new", {foundUser:undefined, today: todayDay});
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
            res.render("feedbacks/show", {username:req.user.username, feedback:foundFeedack, today: todayDay})
        } else {
            res.render("feedbacks/show", {username:undefined, feedback:foundFeedack, today: todayDay})
        }
    })
});

router.get("/future/feedback/:id/edit", middlewareObj.isChocapec, function(req, res){
    Feedback.findById(req.params.id)
    .then((foundFeedback)=>{
        res.render("feedbacks/edit", {username:req.user.username, feedback:foundFeedback, today: todayDay})
    })
});

router.put("/future/feedback/:id", function(req, res){
    Feedback.findById(req.params.id)
    .then((feedbackForUpdating) => {
        feedbackForUpdating.message = req.body.message;
        feedbackForUpdating.save(() => {
            console.log("The feedback was updated!")
            res.redirect("/future/feedback", {today: todayDay});
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
    let newUser = new User({name:req.body.name, email:req.body.email, username:req.body.username, country: req.body.country, language:req.body.language});
    User.find({username:newUser.username}, function(err,foundUser){
        if(foundUser.length === 0){
            User.register(newUser, req.body.password, function(err, user){
                if(err){
                    console.log(err)
                    return res.render("register", {today: todayDay});
                } else {
                    passport.authenticate("local")(req, res, function(){
                    req.flash("success", "Welcome to Human Music "+user.username);
                    res.redirect("/");
                    });
                }
            });
        } else {
            return res.render("register", {today: todayDay});
        }
    });
});

// show login form
router.get("/login", function(req, res){
    if(req.isAuthenticated()) {
        res.redirect("/");
    } else {
        res.render("login", {today: todayDay})
    }
});

router.get("/loginFailure", function(req,res){
    res.render("loginFailure", {today: todayDay});
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
    res.redirect("/goodbye");
});

router.get("/:anything", function(req, res) {
    res.render("nonExisting", {today: todayDay});
})


module.exports = router;