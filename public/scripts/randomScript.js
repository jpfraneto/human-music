
const favoriteButton = document.getElementById("addFavoriteButton");
const unFavoriteButton = document.getElementById("removeFavoriteButton");
let muteButton = document.getElementById("muteButton");
let fsButton = document.getElementById("fullscreenButton");

timer = setInterval(updateCountdown, 1000);

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

function onPlayerStateChange (event){
  //Do something when the state of the player changes
}

function onPlayerReady(event) {
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

function updateCountdown () {
    let presentTimeSpan = document.getElementById("presentClock");
    presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
}

if(favoriteButton || unFavoriteButton){
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

  toggleButtons(false);
  
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
}

