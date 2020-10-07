const axios = require("axios");
const moment = require("moment");
const Recommendation = require("../models/recommendation");
const Day = require("../models/day");
const Cycle = require("../models/cycle");
const User = require("../models/user");
seedDB        = require("../seeds");
let chiita = {};

let eclipseTimestamp = 1607962479000;
let eclipseDateObject = new Date(eclipseTimestamp);

// FOR GETTING THE VIDEO INFORMATION
chiita.youtube_parser = function(url){
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
};

chiita.getRecommendationInfo = function(url) {
    videoID = youtube_parser(url);
    keyAPI = process.env.YOUTUBE_APIKEY;
    urlRequest = "https://www.googleapis.com/youtube/v3/videos?id="+videoID+"&key="+keyAPI+"%20&fields=items(id,snippet(title,description),contentDetails(duration,%20regionRestriction),statistics)&part=snippet,contentDetails,statistics"
    const getVideoInfo = () =>{
        try {
            return axios.get(urlRequest);
        } catch (error) {
            console.error(error)
        }
    }

    const showInfo = async () => {
        const information = getVideoInfo()
        .then(response => {
            if (response.data){
                let videoData = JSON.parse(JSON.stringify(response.data))
                let durationISO = videoData.items[0].contentDetails.duration;
                let videoTitle = videoData.items[0].snippet.title;
                let durationInSeconds = (moment.duration(durationISO, moment.ISO_8601)).asSeconds();
                return [videoTitle, durationInSeconds]
            }
        })
        .catch(error => {
            console.log(error)
        })
    }
}

chiita.getSourceURL = function(url) {
    let source = url + "?autoplay=1";
    let src1 = source.slice(32);
    sourceFinal = "https://www.youtube.com/embed/" + src1;
    return sourceFinal
}

//BIG BANG!
chiita.bigBang = () => {
    Day.deleteMany({},function(err){if(err){console.log(err);}});  
    Cycle.deleteMany({},function(err){if(err){console.log(err);}});  
    Recommendation.deleteMany({},function(err){if(err){console.log(err);}});  
    User.deleteMany({},function(err){if(err){console.log(err);}});  
    // seedDB();
    setTimeout(function(){
        console.log("' .     .    .              .'... The big bang happened. Emptyness. Void. Action");
    }, 1000);
    // setTimeout(()=>{
    //     chiita.createNewDay();
    // }, 2000)
}

//For managing everything related to building the presents

chiita.sendDayToPast = () => {
    Day.findOne({status:"present"})
    .then((foundDay)=>{
        foundDay.status = "past";
        foundDay.save(()=>{
            console.log("The day "+ foundDay.daySKU +" was sent to the past")
        })
    })
}

chiita.theDarkSideOfTheMoon = () => {
    //Start everything from the beginning. This will happen for the eclipse, at the timestamp XXXXXXXXXX. Create the first day of all.
}

let timeInDay = 86400000;
// let timeInDay = 33333000;

chiita.createNewDay = async () => {
    Day.findOne({status:"present"})
    .then((presentDay)=>{
        if (presentDay){
            presentDay.status = "past"
            presentDay.save(()=>{
                console.log("The day that was in the present was sent to the past");
            })
        }
    })
    let information = await chiita.bringMusicFromTheFuture();
    let dayIndex = await chiita.getPresentDay();
    let totalRecommendationsOfThisDay = information.numberOfMusicVideos + 1;
    let elapsedDaytime = 0;
    let now = new Date();
    let daySKU = changeDateFormat(now);
    let startingDayTimestamp = now.getTime();
    let recommendationsOfThisDay = [];
    let todaysFilm = information.filmForToday;
    let recommendationDurationsOfThisDay = [todaysFilm.duration];
    todaysFilm.status = "present";
    todaysFilm.save(()=>{
        recommendationsOfThisDay.push(todaysFilm);
        elapsedDaytime += todaysFilm.duration;
        for (let i=0; i<totalRecommendationsOfThisDay-1;i++) {
            recommendationDurationsOfThisDay.push(information.musicForToday[i].duration);
            recommendationsOfThisDay.push(information.musicForToday[i]);
            elapsedDaytime += information.musicForToday[i].duration;
        }
        let chiDurationForThisDay = Math.round((timeInDay-elapsedDaytime)/totalRecommendationsOfThisDay);
        let newDay = new Day({
            dayIndex : dayIndex,
            startingDayTimestamp : startingDayTimestamp,
            status : "present",
            daySKU : daySKU,
            totalRecommendationsOfThisDay : totalRecommendationsOfThisDay,
            elapsedRecommendations : 0,
            chiDurationForThisDay : chiDurationForThisDay,
            recommendationsOfThisDay : recommendationsOfThisDay,
            recommendationDurationsOfThisDay : recommendationDurationsOfThisDay
        })  
        chiita.addTimestampsToRecommendations(newDay);
        newDay.save(() => {
            console.log("A new day was created!")
            setTimeout(chiita.changeRecommendation, todaysFilm.duration)
            // setTimeout(chiita.changeRecommendation, 6000); //change the recommendation that is in the present after the film is over
        });
    });
}

chiita.addTimestampsToRecommendations = (newDay) => {
    console.log("inside the function addTimestampsToRecommendations");
    let elapsedDayTimestamp = newDay.startingDayTimestamp;
    newDay.recommendationsOfThisDay.forEach((recommendation)=>{
        recommendation.startingRecommendationTimestamp = elapsedDayTimestamp;
        recommendation.save();
        elapsedDayTimestamp += recommendation.duration + newDay.chiDurationForThisDay;
    });
    console.log("All the recommendations timestamps have been updated!");
}

chiita.changeRecommendation = () => {
    Day.findOne({status:"present"})
    .then((presentDay) => {

        chiita.sendRecommendationToPast(presentDay.recommendationsOfThisDay[presentDay.elapsedRecommendations])
        presentDay.elapsedRecommendations ++;
        presentDay.save( () =>{
            if(presentDay.elapsedRecommendations === presentDay.totalRecommendationsOfThisDay){
                console.log("The last recommendation of the day went through");
            } else {
                let timeForNextRecommendation = presentDay.chiDurationForThisDay;
                // let timeForNextRecommendation = 3000;
                setTimeout(chiita.bringRecommendationToPresent, timeForNextRecommendation,  //chi duration
                    presentDay.recommendationsOfThisDay[presentDay.elapsedRecommendations])
                Recommendation.findById(presentDay.recommendationsOfThisDay[presentDay.elapsedRecommendations])
                .then((foundRecommendation) => {
                    // setTimeout(chiita.changeRecommendation, 4000)
                    setTimeout(chiita.changeRecommendation, timeForNextRecommendation + foundRecommendation.duration)
                });
            }
        });
    });
}

chiita.sendRecommendationToPast = (recommendationID) => {
    Recommendation.findById(recommendationID)
    .then((presentRecommendation)=> {
        presentRecommendation.status = "past";
        presentRecommendation.save(()=>{
            console.log("The recommendation was sent to the past!")
        })
    });
}

chiita.bringRecommendationToPresent = (recommendationID) => {
    Recommendation.findById(recommendationID)
    .then((futureRecommendation)=> {
        futureRecommendation.status = "present";
        futureRecommendation.save(()=>{
            console.log("The recommendation was brought to the present!")
        })
    });
}


chiita.bringFilmFromFuture = async () => { //goes to the future to search for a random film
    return Recommendation.find({type:"film", status:"future"})
    .exec()
    .then((foundFilmsFromTheFuture) => {
        let randomFilmFromFuture = foundFilmsFromTheFuture[Math.floor(Math.random() * foundFilmsFromTheFuture.length)];
        return randomFilmFromFuture;
    })
    .catch((err) =>{
        return "An error ocurred getting a film";
    });
};

chiita.bringMusicFromTheFuture = async () => {
    let film = await chiita.bringFilmFromFuture();
    return Recommendation.find({type:"music", status:"future"})
    .exec()
    .then((foundMusicFromTheFuture) => {
        let elapsedTime = film.duration;
        let numberOfMusicVideos = 0;
        let musicForToday = [];
        while (elapsedTime < timeInDay) {
            let randomIndex = Math.floor(Math.random() * foundMusicFromTheFuture.length);
            let randomMusicVideoFromFuture = foundMusicFromTheFuture[randomIndex];
            foundMusicFromTheFuture.splice(randomIndex, 1); //eliminate the chosen element from foundMusic (So that it doesn't repeat)
            musicForToday.push(randomMusicVideoFromFuture); //add the chosen element to the musicForToday array
            elapsedTime += randomMusicVideoFromFuture.duration; //update elapsed time of this day
            numberOfMusicVideos++; //update the counter of the number of music recommendations of that day
        }
        musicForToday = musicForToday.slice(0, musicForToday.length -1);
        numberOfMusicVideos--
        return {
            filmForToday: film,
            musicForToday: musicForToday,
            numberOfMusicVideos : numberOfMusicVideos
        };
    })
    .catch((err) =>{
        return "An error ocurred getting the music";
    });
};

chiita.getPresentDay = async () => {
    return Day.find()
    .exec()
    .then ((foundDays) => {
        return foundDays.length
    });
}

//Functions for date format for the new day

function changeDateFormat(date){
    let formatedDate = "";
    let day = (date.getDate()<10) ? "0" + date.getDate() : date.getDate();
    formatedDate += day;
    formatedDate += date.getFullYear();
    formatedDate += romanize(date.getMonth()+1);
    return formatedDate;
}

function romanize (num) {
    if (isNaN(num))
        return NaN;
    let digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

chiita.changeDateFormat = (date) => {
    let formatedDate = "";
    let day = (date.getDate()<10) ? "0" + date.getDate() : date.getDate();
    formatedDate += day;
    formatedDate += date.getFullYear();
    formatedDate += romanize(date.getMonth()+1);
    return formatedDate;
}

module.exports = chiita;