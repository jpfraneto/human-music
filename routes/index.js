let express = require("express");
let router = express.Router();
let passport = require("passport");
let Recommendation = require("../models/recommendation");
let User = require("../models/user");
let Day = require("../models/day");
let Cycle = require("../models/cycle");
let RetreatForm = require("../models/retreatForm");
const middleware = require("../middleware");
let theSource = require("../middleware/theSource");

// Root Route
router.get("/", function(req,res){
    Recommendation.findOne({status:"present"}, function (err, presentRecommendation){
        if(err){console.log(err)}
        else {
            if (!presentRecommendation){
                Day.findOne({status:"present"}).populate("recommendationsOfThisDay").exec(function(err, presentDay){
                    if(err){
                        console.log(err)
                    } else {
                        let nextRecommendationIndex = presentDay.elapsedRecommendations;
                        let nextRecommendationTimestamp = presentDay.recommendationsOfThisDay[nextRecommendationIndex].startingRecommendationTimestamp;
                        res.render("theVoid", {nextRecommendationTimestamp: nextRecommendationTimestamp, chiDuration:Math.round(presentDay.chiDurationForThisDay/1000)});
                    }
                });
            } else {
                presentRecommendation.url = theSource.getSourceURL(presentRecommendation.url);
                let now = (new Date()).getTime();
                let elapsedTime = now - presentRecommendation.startingRecommendationTimestamp; 
                let elapsedSeconds = Math.floor(elapsedTime/1000);
                res.render("present", {elapsedSeconds:elapsedSeconds, presentRecommendation: presentRecommendation});
            }
        }
    });
});

router.get("/past", middleware.isLoggedIn, function(req,res){
    Day.find({}).populate("recommendationsOfThisDay")
    .then((foundDays) => {
        res.render("past", {days:foundDays}); 
    });
});

router.get("/future", middleware.isLoggedIn, function(req,res){
    res.render("future"); 
});

// show register form
router.get("/register", function(req, res){
    res.render("register");
});

router.get("/about", function(req, res){
   res.render("about"); 
});

router.get("/days", middleware.isLoggedIn, function(req, res){
    Day.find({status:"past"}).populate("recommendationsOfThisDay").exec(function(err, foundDays){
        if(err){
            console.log(err); 
        } else {
            res.render("days/index", {pastDays:foundDays}); 
        }
    })
 });

 router.get("/days/:daySKU", middleware.isLoggedIn, function(req, res){
    Day.findOne({daySKU : req.params.daySKU}).populate("recommendationsOfThisDay").exec(function(err, foundDay){
        if(err){
            console.log(err)
        } else {
            res.render("days/show", {thisDay: foundDay});
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

 router.get("/cycles", middleware.isLoggedIn, function(req, res){
    Cycle.find({}, function(err, foundCycles){
        res.render("cycles/index", {cycles:foundCycles}); 
    });
 });

 router.get("/cycles/:id", middleware.isLoggedIn, function(req, res){
    Cycle.findById(req.params.id).populate("daysOfThisCycle").exec(function(err, foundCycle){
        let startingTimestamp = foundCycle.cycleStartingTimestamp;
        let date = new Date(startingTimestamp);
        let startingDate = theSource.changeDateFormat(date);
        let endingMoment = new Date(startingTimestamp + 1000*60*60*24*foundCycle.cycleDuration);
        let endingDate = theSource.changeDateFormat(endingMoment);
        res.render("cycles/show", {cycle:foundCycle, days:foundCycle.daysOfThisCycle, startingDate:startingDate, endingDate:endingDate}); 
    });
 });

 router.get("/goodbye", function(req, res){
    res.render("goodbye"); 
 });

 router.get("/random", middleware.isLoggedIn, function(req, res){
    Recommendation.find({status:"past", type:"music"}, function(err, allPastRecommendations){
        if(err){
            console.log(err);
        } else {
            if(allPastRecommendations.length === 0){
                res.redirect("/")
            } else {
                let randomRecommendation = allPastRecommendations[Math.floor(Math.random() * allPastRecommendations.length)];
                randomRecommendation.url = theSource.getSourceURL(randomRecommendation.url);
                res.render("random", {randomRecommendation:randomRecommendation});
            }
        }
    });
 });

 //Future routes
 router.get("/future/challenges", middleware.isLoggedIn, function(req, res){
    res.render("future/challenges"); 
 });

 router.get("/future/community", middleware.isLoggedIn, function(req, res){
    res.render("future/community"); 
 });

 router.get("/future/retreats", middleware.isLoggedIn, function(req, res){
    res.render("future/intenseRetreat"); 
 });

 router.get("/future/retreats/new", middleware.isLoggedIn,  function(req, res){
     res.render("retreats/new");
 })

 router.post("/future/retreats", function(req,res){
    let newRetreatForm = new RetreatForm({
        author : {
            id: req.user._id,
            username: req.user.username,
            country: req.user.country
        },
        message: req.body.message,
        messageDate: new Date()
    });
    newRetreatForm.save(console.log("The new retreat form was saved"));
    res.redirect("/future/retreats")
 });

 router.get("/future/podcast", middleware.isLoggedIn, function(req, res){
    res.render("future/podcast"); 
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