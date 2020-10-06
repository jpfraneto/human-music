const axios = require("axios");
const moment = require("moment");
var Recommendation = require("../models/recommendation");
var Day = require("../models/day");
var functions = {};

functions.sayHello =function(){
    console.log("Hello world, I'm inside the functions")
}

functions.youtube_parser = function(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
};

functions.getRecommendationInfo = function(url) {
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

function sendToPast(){
    //Change the status of the video that is in the present to the past
    //Check how is the [DAYSKU] array related to the length of this video. If this is the last video, append it at the end and create a [DAYSKU+1] array for the next day
    //Look in the past for the last recommendation that was sent and add this after that one. It will be something like [DAYXSKU].append(presentRecommendation)
};

function chooseFromFuture(){
    //Evaluate contrains for choosing the next recommendation from all of those from the future.
    //return nextRecommendationForThePresent
};

function passRecommendation(){
    //This functions has to run when the time of the present recommendation is over it should be with the function setTimeout
    //Choose a recommendation from the future with chooseFromFuture()
    //Move the recommendation from the present to the past with sendToPast()
    //If there is no more recommendations in the future, bring one from the backup database, which I have to create and seed with my recommendations
}

async function createNewDay(){
    let finishedDay = new Day();
    let daytimeElapsed = 0;
    let today = new Date();
    let newDay = []
    let numberOfMusicRecommendations = 0;
    let musicRecommendation;
    today = changeDateFormat(today);
    finishedDay.daySku = today;
    finishedDay.elapsedTimeOfThisDay = 0;
    //This from down here occurs asynchronously. I have to use async, await and then for this to work out
    let filmForThisDay = await chooseFilmFromFuture();
    daytimeElapsed += filmForThisDay.duration;
    newDay.push(filmForThisDay);
    let musicRecommendationsForTodayArray = await chooseMusicFromFuture(daytimeElapsed);
    numberOfMusicRecommendations = musicRecommendationsForTodayArray.k;

    for (let m=0; m<musicRecommendationsForTodayArray.length; m++){
        newDay.push(musicRecommendationsForTodayArray[m]);
    };

    let bakedDay = newDay.slice(0, newDay.length-1);
    let sumDurations = 0;

    for (let i=0; i<bakedDay.length; i++){
        sumDurations += bakedDay[i].duration;
    }

    let delta = 86400 - sumDurations;
    let chi = delta/numberOfMusicRecommendations;
    let comodinRecommendation = new Recommendation({duration:chi, status:"present", type:"video"});
    finishedDay.recommendationsOfThisDay.push(filmForThisDay);
    for (let j=0; j<bakedDay.length;j++){
        finishedDay.recommendationsOfThisDay.push(comodinRecommendation);
        finishedDay.recommendationsOfThisDay.push(bakedDay[j]);
    }
    console.log("Aca estoy ctm!");
    console.log(finishedDay);
    return finishedDay;
}

createNewDay();

//Functions for the new day:
function chooseMusicFromFuture(todaysMovieDuration){
    Recommendation.find({type:"music", status:"future"}, function (err, foundMusicVideos){
        if(err){
            console.log(err);
        } else {
            //The idea is to make this algorythm more complex and have in mind other parameters (country, language, wasMadeByUser), not just random. But for now, it works
            let elapsedTime = todaysMovieDuration;
            let k = 0;
            let musicForToday = [];
            while (elapsedTime < 86400){
                let randomIndex = Math.floor(Math.random() * foundMusicVideos.length);
                let randomMusicVideoFromFuture = foundMusicVideos[randomIndex];
                foundMusicVideos.splice(randomIndex, 1); //eliminate the chosen element
                musicForToday.push(randomMusicVideoFromFuture); //add the chosen element to the musicForToday array
                elapsedTime += randomMusicVideoFromFuture.duration;
                k++;
            }
            return {
                musicForToday: musicForToday, 
                k:k
            };
        }
    });
};

function chooseFilmFromFuture(){
    Recommendation.find({type:"film", status:"future"}, function(err, foundFilms){
        if(err){
            console.log(err);
        } else {
            console.log("esta buscandooooo");
            let randomFilmFromFuture = foundFilms[Math.floor(Math.random() * foundFilms.length)];
            //It is missing to change the status of this movie to "present" and then to "past"
            return randomFilmFromFuture
        }
    })
}


//Functons for date format for the new day
function changeDateFormat(date){
    let formatedDate = "";
    let day = (date.getDay()<10) ? "0" + date.getDay() : date.getDay();
    formatedDate += day;
    formatedDate += date.getFullYear();
    formatedDate += romanize(date.getMonth());
    return formatedDate;
}

function romanize (num) {
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

module.exports = functions;