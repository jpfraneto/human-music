const axios = require("axios");
const moment = require("moment");
let Recommendation = require("../models/recommendation");
let Day = require("../models/day");
let Cycle = require("../models/cycle");
seedDB        = require("../seeds");
let theSource = {};


// FOR GETTING THE VIDEO INFORMATION
theSource.youtube_parser = function(url){
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
};

theSource.getRecommendationInfo = function(url) {
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

theSource.getSourceURL = function(url) {
    let source = url + "?autoplay=1";
    let src1 = source.slice(32);
    sourceFinal = "https://www.youtube.com/embed/" + src1;
    return sourceFinal
}

//The following are all the functionalities that are associated with changing the status of the different elements of the platform.

theSource.bigBang = () => {
    Day.deleteMany({},function(err){if(err){console.log(err);}});  
    Cycle.deleteMany({},function(err){if(err){console.log(err);}});  
    seedDB();
    theSource.createFirstDay();
    theSource.createFirstCycle();
    // setInterval(theSource.createNewDay, 3000);
    setTimeout(function(){
        // theSource.createCycle();
        // let newDay = await theSource.createNewDay();
        console.log("' .     .    .              .'... The big bang happened. Emptyness. Void. Action");
    }, 1000)
    setTimeout(function(){
        theSource.newTimeTravel();
    }, 2000);
}

theSource.newTimeTravel = async () => { //This function is the one that holds the functionality of the platform
    //console.log("inside the magic");
    let nextRecommendation = await theSource.bringRecommendationFromTheFuture(); // Brings a random recommendation from the future
    setTimeout(function(){
        theSource.changeRecommendationStatusToPast(nextRecommendation._id);
    }, nextRecommendation.duration, nextRecommendation);
    theSource.changeRecommendationStatusToPresent(nextRecommendation._id);
}

theSource.bringRecommendationFromTheFuture = async () => { //Brings a random recommendation from the future. It would be great to make it more complex and put on the algorythm the functionality of the country of recommenders, etc.
    // console.log("Inside the bringRecommendationFromTheFuture function");
    return Recommendation.find({status:"future"})
    .exec()
    .then((foundFutureMusic) => {
        let randomIndex = Math.floor(Math.random() * foundFutureMusic.length);
        let randomRecommendationFromTheFuture = foundFutureMusic[randomIndex];
        return randomRecommendationFromTheFuture;
    });
}

theSource.changeRecommendationStatusToPresent = (nextRecommendationID) => { //
    // console.log("Inside the changeRecommendationStatusToPresent function");
    let now = new Date();
    let presentTimestamp = now.getTime();
    Recommendation.findByIdAndUpdate(nextRecommendationID, {status:"present", startingRecommendationTimestamp:presentTimestamp}, function(err, newPresentRecommendation){
        if(err){console.log(err)}
        else {
            console.log("Changed the Recommendation status to present, and it's starting timestamp is: " + presentTimestamp);
        }
    });
};

theSource.changeRecommendationStatusToPast = (presentRecommendationID) => { //This function changes the status of the present recommendation to past
    // console.log("Inside the changeRecommendationStatusToPast function");
    Recommendation.findByIdAndUpdate(presentRecommendationID, {status:"past"}, function(err, newPastRecommendation){
        if(err){console.log(err)}
        else {
            console.log("Changed the Recommendation status to past");
            theSource.addRecommendationToDay(newPastRecommendation);
            theSource.newTimeTravel(); //Bring a new recommendation from the future and iterate again.
        }
    });
};

let dayDuration = 22222000;

theSource.addRecommendationToDay = (newPastRecommendation) => {
    //This is shot when the recommendation is sent to the past. If the present day is full, a new day is created and the recommendation is added to this one 
    Day.findOne({status:"present"})
    .then(foundPresentDay => {
        let elapsedDaytime = foundPresentDay.elapsedDaytime;
        console.log("The elapsed daytime of this day is (before adding the new recommendation): " + elapsedDaytime);
        if (elapsedDaytime + newPastRecommendation.duration > dayDuration){
            //Send the recommendation that was brought back to the future.

            foundPresentDay.status = "past";
            foundPresentDay.save()
            .then(console.log("The day was sent to the past"));

            theSource.addDayToCycle(foundPresentDay);

            // Create a new day with status:"present"
            Day.countDocuments() 
            .then(count => {
                let now = new Date();
                let newDay = new Day ({
                    dayIndex: count,
                    startingDayTimestamp: now.getTime(),
                    status: "present",
                    daySKU: changeDateFormat(now),
                    totalRecommendationsOfThisDay: 0,
                    elapsedDaytime : 0,
                });

                // Add the film as the first recommendation of that day.
                newDay.recommendationsOfThisDay.push(newPastRecommendation);
                newDay.recommendationDurationsOfThisDay.push(newPastRecommendation.duration);
                newDay.elapsedDaytime += newPastRecommendation.duration;
                newDay.totalRecommendationsOfThisDay ++;
                newDay.save()
                .then(console.log("A new day was created and the recommendation was added to that one"));
            })
            .catch((err)=> {
                return "There was an error in the create new day function!"
            })
            
        } else {
            foundPresentDay.recommendationsOfThisDay.push(newPastRecommendation);
            foundPresentDay.recommendationDurationsOfThisDay.push(newPastRecommendation.duration);
            foundPresentDay.elapsedDaytime += newPastRecommendation.duration;
            foundPresentDay.totalRecommendationsOfThisDay ++;
            foundPresentDay.save()
            .then(console.log("The present day was saved!"));
        }
    })
}

theSource.addDayToCycle = (newPastDay) => {
    //This is shot when the day is sent to the past 
    Cycle.findOne({status:"present"})
    .then(foundPresentCycle => {
        let elapsedDaysInCycle = foundPresentCycle.daysOfThisCycle.length;
        console.log("The elapsed days of this cycle are: " + elapsedDaysInCycle);
        if (foundPresentCycle.cycleDuration === elapsedDaysInCycle){
            // This means that the cycle is full. Time to make a new cycle
            foundPresentCycle.daysOfThisCycle.push(newPastDay);
            foundPresentCycle.elapsedDaysOfThisCycle ++;
            foundPresentCycle.status = "past";
            foundPresentCycle.save()
            .then(console.log("The last day of the cycle was added"))
            theSource.createNewCycle()
        } else {
            foundPresentCycle.daysOfThisCycle.push(newPastDay);
            foundPresentCycle.elapsedDaysOfThisCycle ++;
            foundPresentCycle.save()
            .then(console.log("A day was added to the cycle"));
        }
    })
}

theSource.createFirstDay = async () => {
    let now = new Date();
    let firstDay = new Day ({
        dayIndex: 0,
        startingDayTimestamp: now.getTime(),
        status: "present",
        cycleName: "",
        daySKU: changeDateFormat(now),
        totalRecommendationsOfThisDay: 0,
        elapsedDaytime : 0
    });
    await firstDay.save()
    .then(console.log("The first day was created"))
    .catch(err => {console.log("There was an error")});
}

theSource.createNewDay = async () => {
    console.log("Inside the create new day function");
    Day.countDocuments() 
    .then(count => {
        let now = new Date();
        let newDay = new Day ({
            dayIndex: count,
            startingDayTimestamp: now.getTime(),
            status: "present",
            cycleName: "",
            daySKU: changeDateFormat(now),
            totalRecommendationsOfThisDay: 0,
            elapsedDayTime : 0
        });
        newDay.save()
        .then(console.log("A new day was created, with index: "+ count));
    })
    .catch((err)=> {
        return "There was an error in the create new day function!"
    })
}

theSource.createFirstCycle = async () => {
    let now = new Date();
    let firstCycle = new Cycle ({
        cycleDuration: 3,
        cycleName: "Cycle of the Depend Adult Undergarment",
        cycleIndex: 0,
        cycleStartingTimestamp: now,
        elapsedDaysOfThisCycle: 0,
        status: "present",
        daysOfThisCycle: []
    });
    await firstCycle.save()
    .then(console.log("The first cycle was created"))
    .catch(err => {console.log("There was an error creating the first cycle!")});
}

let cycleNames = ["Cycle of the Depend Adult Undergarment", "Cycle of the Whopper", "Cycle of the Tucks Medicated Pad", "Cycle of the Trial-Size Dove Bar",
"Cycle of the Perdue Wonderchicken", "Cycle of the Whisper-Quiet Maytag Dishmaster", 
"Cycle of the Yushityu 2007 Mimetic-Resolution-Cartridge-View-Motherboard-Easy-To-Install-Upgrade For Infernatron/InterLace TP Systems For Home, Office Or Mobile",
"Cycle of Dairy Products from the American Heartland", "Cycle of Glad"]

theSource.createNewCycle = async () => {
    console.log("Inside the create new cycle function");
    Cycle.countDocuments() 
    .then(count => {
        let now = new Date();
        let newCycle = new Cycle ({
            cycleDuration: Math.floor(5*Math.random()),
            cycleName: cycleNames[count],
            cycleIndex: count,
            cycleStartingTimestamp: now,
            elapsedDaysOfThisCycle: 0,
            status: "present",
            daysOfThisCycle: []
        });
        newCycle.save()
        .then(console.log("A new cycle was created, with index: "+ count));
    })
    .catch((err)=> {
        return "There was an error in the create new cycle function!"
    })
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

theSource.changeDateFormat = (date) => {
    let formatedDate = "";
    let day = (date.getDate()<10) ? "0" + date.getDate() : date.getDate();
    formatedDate += day;
    formatedDate += date.getFullYear();
    formatedDate += romanize(date.getMonth()+1);
    return formatedDate;
}

module.exports = theSource;