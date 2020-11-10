let systemInformation, iFrameGlobalElement, timer, delay, recommendationInfo, voidInfo, currentUser;

const favoriteButton = document.getElementById("addFavoriteButton");
const unFavoriteButton = document.getElementById("removeFavoriteButton");
let muteButton = document.getElementById("muteButton");
let fsButton = document.getElementById("fullscreenButton");

timer = setInterval(updateCountdown, 1000);

window.onload = () => {
  systemInformationPromise = getSystemInformation();
  systemInformationPromise.then((systemInformation) => {
    systemStatus = systemInformation.systemStatus;
    toggleButtons(systemInformation.isFavorited);
    let now = (new Date).getTime();
    delay = systemInformation.nextEventStartingTimestamp - now;
    setTimeout(intoTheVoid, delay);
  })
};

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
  let muteButton = document.getElementById("muteButton");
  muteButton.addEventListener("click", ()=> {
    if (player.isMuted()){
      player.unMute();
    } else {
      player.mute();
    }
  })
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
  systemInformationPromise = getSystemInformation();
  
  systemInformationPromise.then((systemInformation) => {
    if(systemInformation.systemStatus === "void"){
      
      let now = (new Date).getTime();
      delay = systemInformation.nextEventStartingTimestamp - now;
      setTimeout(outOfTheVoid, delay);

      iFrameGlobalElement = null;
      iFrameGlobalElement = $("#presentPlayer").detach();
      
      voidInformation();
    } else {
      intoTheVoid();
    }
  })
}

function outOfTheVoid () {
  systemInformationPromise = getSystemInformation();
  
  systemInformationPromise.then((systemInformation)=>{
    if(systemInformation.systemStatus === "recommendation"){

      let now = (new Date).getTime();
      delay = systemInformation.nextEventStartingTimestamp - now;
      setTimeout(intoTheVoid, delay);

      let container = document.getElementById("mediaContainer");
      let newSrc = "https://www.youtube.com/embed/" + systemInformation.recommendation.youtubeID + "?start=0&autoplay=1&enablejsapi=1&controls=0";
      iFrameGlobalElement[0].src = newSrc;
      let voidImage = document.getElementById("voidImage");
      voidImage.remove();
    
      iFrameGlobalElement.appendTo(container);

      updateRecommendation(systemInformation.recommendation);
    } else {
      outOfTheVoid();
    }
  })
}

function updateRecommendation (presentRecommendation) {
  recommendationInfo = document.getElementById("presentRecommendationInformation");
  voidInfo = document.getElementById("voidInformation");
  recommendationInfo.style.display = "block";
  voidInfo.style.display = "none";

  let username = document.getElementById("username");
  let userCountry = document.getElementById("userCountry");
  let dateOfRecommendation = document.getElementById("dateOfRecommendation");
  let recommendationName = document.getElementById("recommendationName");
  let recommendationDescription = document.getElementById("recommendationDescription");

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

async function voidInformation () {
  fetch("https://api.nasa.gov/planetary/apod?api_key=OMcSf5neLQv0rUKv8xebrLM63HFac79GpysEI5Yr")
  .then(response=>response.json())
  .then((apod)=>{
    let container = document.getElementById("mediaContainer");
    let newImage = document.createElement("img");
  
    newImage.id = "voidImage";
    newImage.src = apod.url;
    container.appendChild(newImage);

    let nasaTitle = document.getElementById("nasaTitle")
    let nasaDate = document.getElementById("nasaDate");
    let explanation = document.getElementById("nasaExplanation")

    nasaTitle.innerText = apod.title;
    nasaDate.innerText = apod.date;
    explanation.innerText = apod.explanation;

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
  let controlsDiv = document.getElementById("controlsDiv");
  controlsDiv.style.visibility = "visible";
  muteButton.style.visibility = "visible";
  fsButton.style.visibility = "visible";

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