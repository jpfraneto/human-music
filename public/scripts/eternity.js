let displayedDaySKU, displayedRecommendationID, currentUser;

timer = setInterval(updateCountdown, 1000);

function updateCountdown () {
    let presentTimeSpan = document.getElementById("presentClock");
    presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
}

let player;
var tag = document.createElement('script');
tag.id = 'iframe-demo';
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    console.log("The youtube api is ready");
    player = new YT.Player('presentPlayer', { 
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    displayedRecommendationID = player.getVideoData().video_id;
    getRecommendationInformation(displayedRecommendationID);
}

async function updateDisplay (youtubeID) {
    getRecommendationInformation(youtubeID);
}

async function updateRecommendation (recommendationForUpdateID) {
    player.loadVideoById(recommendationForUpdateID);
    displayedRecommendationID = recommendationForUpdateID;
}

function onPlayerStateChange(event){
    console.log("The state of the player changed");
}

function onPlayerError(event) {
    displayedRecommendationID = "error";
    alert("There was an error loading the video in the player");
}

$(()=>{
    buttonsSetup();
    displayedDaySKU = document.getElementById("displayedDaySku").innerText;
})

function buttonsSetup () {
    let previousButton = document.getElementById("previousButton");
    let nextButton = document.getElementById("nextButton");

    let pastLink = document.getElementById("pastLink");
    pastLink.addEventListener("click", async ()=>{
        pastLink.parentNode.parentNode.childNodes.forEach((tense)=>{
            tense.classList.remove("activeTense");
        })
        pastLink.classList.add("activeTense");

        togglePastModal()
        
        // let targetDay = prompt("To which day do you want to move?");
        // let day = await getDayInformation(targetDay)
        // console.log(day);
        // let pastControls = document.getElementById("recommendationsOfThisDayContainer");
        // pastControls.innerHTML = "";
        // let newDiv;
        // for (let i=0; i<day.youtubeIDS.length;i++){
        //     newDiv = "";
        //     newDiv = document.createElement("div");
        //     newDiv.className = "recommendationContainer";
        //     newDiv.id = day.youtubeIDS[i];
        //     newDiv.innerText = i;
        //     newDiv.addEventListener("click", ()=>{
        //         updateRecommendation(day.youtubeIDS[i]);

        //     });
        //     pastControls.appendChild(newDiv);
        // }
    })

    let currentVolume = document.getElementById("currentVolume");
    let iframe = document.querySelector("iframe");
    //Change Displayed Day Button
    let displayedDayButton = document.getElementById("displayedDaySku");
    displayedDayButton.addEventListener("click", ()=>{
        alert("Here you will be able to change the day SKU that is displayed and travel to the past because of that")
    })

    //Change Displayed Day Index Button
    let displayedDayIndex = document.getElementById("dayIndex");
    displayedDayIndex.addEventListener("click", ()=>{
        alert("Here you will be able to change the day index that is displayed and travel to the past because of that")
    })

    //Favorite Button
    let favoritesButton = document.getElementById("favoriteButton");
    
    favoritesButton.addEventListener("click", async ()=>{
        let method;
        if(true){ //¿Cómo se hace referencia acá al hecho de que haya un usuario logged in o no?
            if(true){ //Qué está activo en el botón? Esto determina la funcionalidad y cuál es la información que se envía al servidor [favorito o no favoritp]
                method = "favorite"
                //Toggle the class to favorited (red)
                //Toggle the data of the button to favorited
                favoritesButton.innerHTML = "<i class='far fa-heart'></i>";
            } else {
                method = "unfavorite"
                //Toggle the class to unfavorited (green)
                //Toggle the data of the button to unfavorited
                favoritesButton.innerHTML = "<i class='fas fa-heart'></i>";
            }
            fetch("/favoriteButton", {
                method : "POST",
                headers: {
                  'Content-Type': 'application/json'
                },
                body : JSON.stringify({displayedRecommendationID:"6PAhw0P3CNA", method:method})
            });
        } else {
            alert("log in to access that functionality");
        }
    });

    //Fullscreen Button
    let fullscreenButton = document.getElementById("fullscreenButton");
    fullscreenButton.addEventListener("click", ()=>{
        let requestFullscreen = iframe.requestFullScreen || iframe.mozRequestFullScreen || iframe.webkitRequestFullScreen;
        if(requestFullscreen){
          requestFullscreen.bind(iframe)();
        }
    });

    //Volume Display
    let volumeDisplay = document.getElementById("volumeDisplay");
    volumeDisplay.addEventListener("click", ()=>{
        if(player.isMuted()){
            player.unMute();
            volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
            currentVolume.innerText = player.getVolume();
          } else {
            player.mute();
            volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>'
            currentVolume.innerText = "";
          }
        //This should mute or unmute the player and change the icon of this button
    });
    
    //Volume Bar
    let volumeBar = document.getElementById("volumeBar");
    volumeBar.addEventListener("change", (e)=>{
        let newVolume = e.target.value;
        player.unMute();
        player.setVolume(newVolume);
        volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
        currentVolume.innerText = newVolume;
        //Here the volume of the player should change to the value of e.target.value
    });

    //Day Progress
    // let dayProgressRange = document.getElementById("dayProgress");
    // let displayedDaySKU = document.getElementById("displayedDaySku").innerText;
    // dayProgressRange.addEventListener("change", (e) => {
    //     let now = (new Date()).getTime()
    //     if ( e.target.value > now){
    //         e.target.value = now;
    //     } else {
    //         timeTravel(displayedDaySKU, e.target.value);
    //     }
    // })
}

async function timeTravel(displayedDaySKU, targetTimestamp){
    const response = await fetch("/timeTravel", {
        method : "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body : JSON.stringify({daySKU:displayedDaySKU , targetTimestamp : targetTimestamp})
    });
    const recommendation = await response.json();
    updateRecommendation(recommendation.recommendation);
}

async function getRecommendationInformation (youtubeID){
    const query = await fetch("/getRecommendationInformation", {
        method : "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body : JSON.stringify({youtubeID:youtubeID, daySKU : "232020XII"})
    });
    const response = await query.json();
    return response
}

// async function setupProgressButtons () {
//     let newDiv = document.createElement("div");
//     let dayProgressDiv = document.getElementById("dayProgress");
//     dayProgressDiv.classList.add("dayProgressDisplay");
//     newDiv.classList.add("recommendationSquare");
//     let dayInformation = await getDayInformation(displayedDaySKU)
//     let recommendationSquaresContainer = document.getElementById("recommendationSquaresContainer");
//     for(i=0;i<dayInformation.totalRecommendationsOfThisDay;i++){
//         newDiv.innerText = i;
//         recommendationSquaresContainer.appendChild(newDiv);
//         console.log("A div was added to the list")
//     }
// }

async function getDayInformation(thisDay){
    let query = await fetch("/getDayInformation", {
        method : "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body : JSON.stringify({daySKU:thisDay})
    });
    let response = await query.json();
    return response;
}

let infoModal = document.getElementById("infoModal");
let show = document.querySelector(".show");
let closeButton = document.querySelector(".close-button");

function toggleModal() {
    infoModal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === infoModal) {
        toggleModal();
    } else if (event.target === pastModal) {
        togglePastModal();
    }
}

let pastModal = document.getElementById("pastModal");

function togglePastModal() {
    pastModal.classList.toggle("show-modal");
}

show.addEventListener("click", async ()=>{

    let response = await getRecommendationInformation(displayedRecommendationID);
    let displayedRecommendation = response.displayedRecommendation;

    let username = document.getElementById("username");
    let country = document.getElementById("userCountry");
    let recommendationName = document.getElementById("recommendationName");
    let dateOfRecommendation = document.getElementById("dateOfRecommendation");
    let description = document.getElementById("recommendationDescription");

    username.innerText = displayedRecommendation.author.username;
    country.innerText = displayedRecommendation.author.country;
    recommendationName.innerText = displayedRecommendation.name;
    dateOfRecommendation.innerText = displayedRecommendation.recommendationDate;
    description.innerText = displayedRecommendation.description;
    toggleModal();
});
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);

let closePastModalButton = document.getElementById("closePastModalButton");
closePastModalButton.addEventListener("click", togglePastModal);

let getPastBtn = document.getElementById("getPastBtn");
getPastBtn.addEventListener("click", async ()=>{
    let response = await fetch("/getPastDays")
    response.json().then((pastDays)=>{
        console.log(pastDays);
    })
})