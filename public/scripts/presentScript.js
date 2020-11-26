let systemInformation, iFrameGlobalElement, timer, delay, recommendationInfo, voidInfo, currentUser, recommendationEndingTimestamp, endingTime, volume;

const favoriteButton = document.getElementById("addFavoriteButton");
const unFavoriteButton = document.getElementById("removeFavoriteButton");
let muteButton = document.getElementById("muteButton");
let volumeDownButton = document.getElementById("volumeDown");
let volumeUpButton = document.getElementById("volumeUp");
let volumeDisplayButton = document.getElementById("volumeDisplay");
let currentVolume = document.getElementById("currentVolume");
let fsButton = document.getElementById("fullscreenButton");
let bottomMessage = document.getElementById("recommendationBottomMessage");
let controlsDiv = document.getElementById("controlsDiv");
let volumeIcon = document.getElementById("volumeIcon");

timer = setInterval(updateCountdown, 1000);

function setup () {
  systemInformationPromise = getSystemInformation();
  systemInformationPromise.then((systemInformation) => {
    systemStatus = systemInformation.systemStatus;
    toggleButtons(systemInformation.isFavorited);
    let now = (new Date).getTime();
    delay = systemInformation.nextEventStartingTimestamp - now;
    console.log("The next event [intoTheVoid] will happen in "+ delay + " milliseconds")
    setTimeout(intoTheVoid, delay);
  })
};

setup();

async function getSystemInformation () {
  const response = await fetch("/checkSystemStatus");
  const presentStatus = await response.json();
  return presentStatus
}

let player, iframe;
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
  showRecommendationInformation();
  setupFullscreenButton();
  setupVolumeDisplayButton();
  // let volumeDownButton = document.getElementById("volumeDown");
  // let volumeUpButton = document.getElementById("volumeUp");
}

function SetVolume(value){
  if (player.isMuted()){
    player.unMute();
    volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>'
  }
  player.setVolume(value);
  currentVolume.innerText = value;
}

function setupVolumeDisplayButton () {
  if(player.isMuted()){
    volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>'
  } else {
    volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>'
  }
  volumeDisplayButton.addEventListener("click", volumeDisplayFunction)
}

function volumeDisplayFunction() {
  if(player.isMuted()){
    player.unMute();
    volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
    currentVolume.innerText = player.getVolume();
  } else {
    player.mute();
    volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>'
    currentVolume.innerText = "";
  }
}

function onPlayerError(event) {
    console.log("There was an error with the player!")
}

function setupFullscreenButton() {
  let fsButton = document.getElementById("fullscreenButton");
  fsButton.addEventListener("click", playFullscreen);
}

function playFullscreen() {
  let iframe = document.querySelector("iframe");
  let requestFullscreen = iframe.requestFullScreen || iframe.mozRequestFullScreen || iframe.webkitRequestFullScreen;
  if(requestFullscreen){
    requestFullscreen.bind(iframe)();
  }
}

function onPlayerStateChange(event) {
    //Do something when the player state changes
}

function showRecommendationInformation () {
  let infoDiv = document.getElementById("presentRecommendationInformation");
  infoDiv.className = "recommendationInformationDisplay"
}

function intoTheVoid () {
  console.log("inside the intoTheVoid function, the getsysteminformation function will run now and check the system status");
  systemInformationPromise = getSystemInformation();
  systemInformationPromise.then((systemInformation) => {
    if(systemInformation.systemStatus === "void"){
      clearInterval(voidTimer);
      controlsDiv.style.visibility = "hidden";
      let now = (new Date).getTime();
      delay = systemInformation.nextEventStartingTimestamp - now;
      console.log("The next event [outOfTheVoid] will happen in "+ delay + " milliseconds")
      setTimeout(outOfTheVoid, delay);

      iFrameGlobalElement = null;
      iFrameGlobalElement = $("#presentPlayer").detach();

      voidInformation(systemInformation.nextEventStartingTimestamp);
    } else {
      voidTImer = setInterval(intoTheVoid,1000);
    }
  })
}

let voidTimer, outVoidTimer;

function outOfTheVoid () {
  console.log("inside the outOfTheVoid function, the getsysteminformation function will run now and check the system status");
  systemInformationPromise = getSystemInformation();
  systemInformationPromise.then((systemInformation)=>{
    if(systemInformation.systemStatus === "recommendation"){
      clearInterval(outVoidTimer);
      controlsDiv.style.visibility = "visible";
      let now = (new Date).getTime();
      delay = systemInformation.nextEventStartingTimestamp - now;
      console.log("The next event [intoTheVoid] will happen in "+ delay + " milliseconds")
      setTimeout(intoTheVoid, delay);

      let container = document.getElementById("mediaContainer");
      let newSrc = "https://www.youtube.com/embed/" + systemInformation.recommendation.youtubeID + "?start=0&autoplay=1&enablejsapi=1&controls=0";
      iFrameGlobalElement[0].src = newSrc;
      let voidImage = document.getElementById("presentVoidImage");
      voidImage.remove();
    
      iFrameGlobalElement.appendTo(container);

      updateRecommendation(systemInformation);
    } else {
      outVoidTimer = setInterval(outOfTheVoid,1000);
    }
  })
}

function updateRecommendation (systemInformation) {
  presentRecommendation = systemInformation.recommendation;
  recommendationInfo = document.getElementById("presentRecommendationInformation");
  voidInfo = document.getElementById("voidInformation");
  recommendationInfo.style.display = "block";
  voidInfo.style.display = "none";

  let username = document.getElementById("username");
  let userCountry = document.getElementById("userCountry");
  let dateOfRecommendation = document.getElementById("dateOfRecommendation");
  let recommendationName = document.getElementById("recommendationName");
  let recommendationDescription = document.getElementById("recommendationDescription");

  recommendationEndingTimestamp = presentRecommendation.startingRecommendationTimestamp + presentRecommendation.duration;
  endingRecommendationTime = (new Date(recommendationEndingTimestamp)).toUTCString().substring(17,25);
  bottomMessage.innerText = "This recommendation ends at " + endingRecommendationTime;

  toggleButtons(systemInformation.isFavorited);

  username.innerText = presentRecommendation.author.username;
  userCountry.innerText = presentRecommendation.author.country;
  dateOfRecommendation.innerText = presentRecommendation.recommendationDate;
  recommendationName.innerText = presentRecommendation.name;
  recommendationDescription.innerText = presentRecommendation.description;
}

function updateCountdown () {
  let presentTimeSpan = document.getElementById("presentClock");
  presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
}

async function voidInformation (nextRecommendationStartingTimestamp) {
  fetch("https://api.nasa.gov/planetary/apod?api_key=OMcSf5neLQv0rUKv8xebrLM63HFac79GpysEI5Yr")
  .then(response=>response.json())
  .then((apod)=>{
    let container = document.getElementById("mediaContainer");
    let newImage = document.createElement("img");
    newImage.id = "presentVoidImage";
    newImage.src = apod.url;
    container.appendChild(newImage);

    let nasaTitle = document.getElementById("nasaTitle")
    let nasaDate = document.getElementById("nasaDate");
    let explanation = document.getElementById("nasaExplanation")

    nasaTitle.innerText = apod.title;
    nasaDate.innerText = apod.date;
    explanation.innerText = apod.explanation;

    
    nextStartingTime = (new Date(nextRecommendationStartingTimestamp)).toUTCString().substring(17,25);

    bottomMessage.innerText = "The new recommendation will come soon... At " + nextStartingTime;

    recommendationInfo = document.getElementById("presentRecommendationInformation");
    voidInfo = document.getElementById("voidInformation");
    recommendationInfo.style.display = "none";
    voidInfo.style.display = "block";
  })
}

favoriteButton.addEventListener("click", function(e){
  favoriteButton.style.display = "none";
  unFavoriteButton.style.display = "inline-block";
  fetch("/favorited", {method:"POST"})
  .then((response) =>{
    if(response.ok) {
      return
    }
    throw new Error("Request failed");
  })
  .catch((error)=>{
    console.log(error);
  })
})

unFavoriteButton.addEventListener("click", function(e){
  favoriteButton.style.display = "inline-block";
  unFavoriteButton.style.display = "none";
  fetch("/unfavorited", {method:"POST"})
  .then((response) =>{
    if(response.ok) {
      return
    }
    throw new Error("Request failed");
  })
  .catch((error)=>{
    console.log(error);
  })
})

function toggleButtons (isFavorited) {
  
  controlsDiv.style.visibility = "visible";
  // muteButton.style.visibility = "visible";
  fsButton.style.visibility = "visible";
  // volumeDownButton.style.visibility = "visible";
  // volumeUpButton.style.visibility = "visible";
  volumeDisplay.style.visibility = "visible";

  if(isFavorited != null){
    if(isFavorited){
      favoriteButton.style.display = "none";
      unFavoriteButton.style.display = "inline-block";
    } else {
      favoriteButton.style.display = "inline-block";
      unFavoriteButton.style.display = "none";
    }
}
}

async function checkIfRecommendationIsInDatabase(videoID){
  const response = await fetch("/checkIfRepeated", {
    method : "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body : JSON.stringify({videoID:videoID})
  });
  const data = await response.json();
  if(data.isRepeated){
    alert("Holy shit! That video was already recommended by @" + data.author.username)
  }
}