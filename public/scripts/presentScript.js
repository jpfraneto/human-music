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
let volumeControl = document.getElementById("vol-control");
let volumeControls = document.getElementById("volumeControls");

timer = setInterval(updateCountdown, 1000);

function setup () {
  systemInformationPromise = getSystemInformation();
  systemInformationPromise.then((systemInformation) => {
    systemStatus = systemInformation.systemStatus;
    toggleButtons(systemInformation.isFavorited);
    let now = (new Date).getTime();
    delay = systemInformation.nextEventStartingTimestamp - now + 4444;
    console.log("The next event [intoTheVoid] will happen in "+ delay + " milliseconds");
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
  volumeControls.addEventListener("mouseover", ()=>{
    volumeControl.style.visibility = "visible"
  })
  volumeControls.addEventListener("mouseout", ()=>{
    volumeControl.style.visibility = "hidden"
  })
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
    if(systemInformation.systemStatus === "void" || systemInformation.systemStatus === "endOfDay"){
      controlsDiv.style.display = "none";
      let now = (new Date).getTime();
      delay = systemInformation.nextEventStartingTimestamp - now;
      console.log("The next event [outOfTheVoid] will happen in "+ delay + " milliseconds")
      setTimeout(outOfTheVoid, delay);

      iFrameGlobalElement = null;
      iFrameGlobalElement = $("#presentPlayer").detach();

      voidInformation(systemInformation.nextEventStartingTimestamp);
    } else {
      setTimeout(intoTheVoid, 2000);
    }
  })
}

async function voidInformation (nextRecommendationStartingTimestamp) {
    let container = document.getElementById("mediaContainer");
    let newImage = document.createElement("img");
    newImage.id = "presentVoidImage";
    newImage.src = "https://apod.nasa.gov/apod/image/2011/marsglobalmap_1100.jpg";
    container.appendChild(newImage);

    let nasaTitle = document.getElementById("nasaTitle")
    let nasaDate = document.getElementById("nasaDate");
    let explanation = document.getElementById("nasaExplanation")

    nasaTitle.innerText = "Global Map: Mars at Opposition";
    nasaDate.innerText = "282020XI";
    explanation.innerText = "This may be the best global Mars map made with a telescope based on planet Earth. The image data were captured by a team of observers over six long nights at the Pic du Midi mountaintop observatory between October 8 and November 1, when the fourth rock from the Sun had not wandered far from its 2020 opposition and its biggest and brightest appearance in Earth's night sky. The large telescope used, 1 meter in diameter with a 17 meter focal length, was also used in support of NASA's Apollo lunar landing missions. After about 30 hours of processing, the data were combined to produced this remarkably sharp projected view of the martian surface extending to about 45 degrees northern latitude. The image data have also been mapped onto rotating sphere and rotating stereo views. Fans of Mars can easily pick out their favorite markings on the Red Planet by eyeing a labeled version of this global map of Mars.";
    
    nextStartingTime = (new Date(nextRecommendationStartingTimestamp)).toUTCString().substring(17,25);

    bottomMessage.innerText = "The new recommendation will come soon... At " + nextStartingTime;

    recommendationInfo = document.getElementById("presentRecommendationInformation");
    voidInfo = document.getElementById("voidInformation");
    recommendationInfo.style.display = "none";
    voidInfo.style.display = "block";
}

let voidTimer, outVoidTimer;

function outOfTheVoid () {
  console.log("inside the outOfTheVoid function, the getsysteminformation function will run now and check the system status");
  systemInformationPromise = getSystemInformation();
  systemInformationPromise.then((systemInformation)=>{
    if(systemInformation.systemStatus === "recommendation"){
      controlsDiv.style.display = "block";
      let now = (new Date).getTime();
      // delay = systemInformation.nextEventStartingTimestamp - now;
      delay = systemInformation.recommendation.duration + 4444;
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
      setTimeout(outOfTheVoid, 2000);
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

favoriteButton.addEventListener("click", function(e){
  console.log("The favorite button was clicked");
  favoriteButton.style.display = "none";
  unFavoriteButton.style.display = "inline-block";
  fetch("/favorited", {method:"POST"})
  .then((response) =>{
    if(response.ok) {
      console.log("The recommendation was favorited and added to the user");
    } else {
      throw new Error("Request failed");
    }
  })
  .catch((error)=>{
    console.log(error);
  })
})

unFavoriteButton.addEventListener("click", function(e){
  console.log("The unfavorite button was clicked");
  favoriteButton.style.display = "inline-block";
  unFavoriteButton.style.display = "none";
  fetch("/unfavorited", {method:"POST"})
  .then((response) =>{
    if(response.ok) {
      console.log("The recommendation was unfavorited and deleted from the user");
    } else {
      throw new Error("Request failed");
    }
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

const recommendationForm = document.getElementById("newRecommendationForm");
if (recommendationForm){
  recommendationForm.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(event){
  event.preventDefault();
  const form = event.currentTarget;
  const url = form.action;

  try {
    const formData = new FormData(form);
    const responseData = await postFormDataAsJson({url, formData});
    console.log(responseData);
  } catch (error) {
    console.error(error);
  }
}

async function postFormDataAsJson({url, formData}){
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);
  const fetchOptions = {
    method : "POST",
    headers : {
      "Content-Type": "application/json",
			"Accept": "application/json"
    },
    body : formDataJsonString,
  };
  const response = await fetch (url, fetchOptions);
  
  if(!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  return response.json();
}

