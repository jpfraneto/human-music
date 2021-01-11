const Recommendation = require("../models/recommendation");
const Day = require("../models/day");
const User = require("../models/user");
let seedDB        = require("../seeds2");
let theSource = {};

theSource.bigBang = function(callback) {
    console.log("Inside the big bang function... Emptyness, void... Action");
    Recommendation.find({ $or:[{status:"past"}, {status:"present"}]})
    // Recommendation.find()
    .then((allRecommendations) => {
        allRecommendations.forEach((recommendation) => {
            recommendation.status = "future";
            recommendation.startingRecommendationTimestamp = "";
            recommendation.save(()=>{
                console.log("The recommendation '" + recommendation.name + "' was sent to the future.")
            })
        })
    })
    callback(futureCallback);
}

bringRecommendationFromTheFuture = function(callback){
    sendPresentRecommendationToPast();
    callback();
}

sendPresentRecommendationToPast = function(){
    Recommendation.findOne({status:"present"})
    .then((presentRecommendation)=>{
        if(presentRecommendation){
            presentRecommendation.status = "past";
            presentRecommendation.save(()=>{
                console.log("The recommendation '" + presentRecommendation.name + "' was sent to the past.")
            });
        } else {
            console.log("There was not a recommendation in the present")
        }
    })
}

futureCallback = function(){
    Recommendation.find({status:"future"})
    .then((allFutureRecommendations)=>{
        if(allFutureRecommendations.length === 0){
            theSource.bigBang();
        } else {
            let randomRecommendation = allFutureRecommendations[Math.floor(Math.random() * allFutureRecommendations.length)];
            randomRecommendation.status = "present";
            let startingTimestamp = (new Date()).getTime();
            randomRecommendation.startingRecommendationTimestamp = startingTimestamp;
            randomRecommendation.endingRecommendationTimestamp = startingTimestamp + randomRecommendation.duration;
            randomRecommendation.save(()=>{
                console.log("The recommendation '" + randomRecommendation.name + "' was brought to the present.")
                console.log("The next recommendation will be brought in " + randomRecommendation.duration + " milliseconds, the setTimeout will start now")
                setTimeout(()=>{
                    bringRecommendationFromTheFuture()
                }, randomRecommendation.duration)
            })
        }
    })
}

module.exports = theSource;