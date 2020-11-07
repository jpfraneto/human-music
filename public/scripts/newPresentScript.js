let systemInformation, iFrameGlobalElement, timer;

window.onload = () => {
  systemInformationPromise = getSystemInformation();
  systemInformationPromise.then((systemInformation)=>{
    setTimeout(intoTheVoid, systemInformation.nextEventDelay);
  })
  timer = setInterval(updateCountdown, 1000);
};

async function getSystemInformation () {
  console.log("inside the getSystemInformation function")
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
  let container = document.getElementById("mediaContainer");
  let newImage = document.createElement("img");
  newImage.id = "voidImage";
  newImage.src = "https://apod.nasa.gov/apod/image/2011/Abell2151_Howard_Trottier_2020_FFTelescope1024.jpg";

  iFrameGlobalElement = null;
  iFrameGlobalElement = $("#presentPlayer").detach();
  
  container.appendChild(newImage);

  systemInformationPromise = getSystemInformation();
  
  systemInformationPromise.then((systemInformation)=>{
    setTimeout(outOfTheVoid, systemInformation.nextEventDelay);
  })
}

function outOfTheVoid () {
  let container = document.getElementById("mediaContainer");
  let voidImage = document.getElementById("voidImage");
  voidImage.remove();

  iFrameGlobalElement.appendTo(container);
  let iFrame = document.querySelector("iframe");

  systemInformationPromise = getSystemInformation();
  
  systemInformationPromise.then((systemInformation)=>{
    updateRecommendation(systemInformation.recommendation);
    setTimeout(intoTheVoid, systemInformation.nextEventDelay);
  })
}

function updateRecommendation (presentRecommendation) {
  let iframeVideo = document.getElementById("presentPlayer");

  let username = document.getElementById("username");
  let userCountry = document.getElementById("userCountry");
  let dateOfRecommendation = document.getElementById("dateOfRecommendation");
  let recommendationName = document.getElementById("recommendationName");
  let recommendationDescription = document.getElementById("recommendationDescription");
  let recommendationStatus = document.getElementById("recommendationStatus");

  let newSrc = "https://www.youtube.com/embed/" + presentRecommendation.youtubeID + "?start=0&autoplay=1&enablejsapi=1&controls=0";

  iframeVideo.src = newSrc;
  username.innerText = presentRecommendation.author.username;
  userCountry.innerText = presentRecommendation.author.country;
  dateOfRecommendation.innerText = presentRecommendation.recommendationDate;
  recommendationName.innerText = presentRecommendation.name;
  recommendationDescription.innerText = presentRecommendation.description;
  recommendationStatus.innerText = presentRecommendation.status;
}

function updateCountdown () {
  let presentTimeSpan = document.getElementById("presentClock");
  presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
}