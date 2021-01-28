let systemInformation, iFrameGlobalElement, delay, recommendationInfo, voidInfo, currentUser;

const favoriteButton = document.getElementById("addFavoriteButton");
const unFavoriteButton = document.getElementById("removeFavoriteButton");
const favoritesButton = document.getElementById("favoritesButton");
let bottomMessage = document.getElementById("recommendationBottomMessage");
let controlsDiv = document.getElementById("controlsDiv");
let systemStatus = "present";

let player, iframe;
var tag = document.createElement('script');
tag.id = 'iframe-demo';
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  player = new YT.Player('presentPlayer', { 
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
  });
}

function onPlayerReady(event) {
  let presentID = player.getVideoData()['video_id']
  console.log("The presentID is: " + presentID);
  showControls(presentID);
}

async function showControls(youtubeID) {
  let response = await fetch("/getRecommendationInformation", {
    method : "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body : JSON.stringify({recommendationID:youtubeID})
  });
  let recommendationData = await response.json();
  toggleButtons(recommendationData.isFavorited)
}

function onPlayerError(event) {
    console.log("There was an error with the player!")
}

function onPlayerStateChange(event) {
    //Do something when the player state changes. When the video is over, update it with the next one.
    let displayedID = player.getVideoData()['video_id']
    if (event.data === 0) {
      console.log("The video ended and now the set Timeout will bring the next recommendation")
        setTimeout(()=>{
            queryNextRecomendation(displayedID);
        }, 1618)
    } 
}

function updateRecommendation (recommendationInformation) {
  console.log(recommendationInformation);
  queriedRecommendation = recommendationInformation.recommendation;
  player.loadVideoById(queriedRecommendation.youtubeID);
  voidInfo = document.getElementById("voidInformation");

  let username = document.getElementById("username");
  let userCountry = document.getElementById("userCountry");
  let dateOfRecommendation = document.getElementById("dateOfRecommendation");
  let recommendationName = document.getElementById("recommendationName");
  let recommendationDescription = document.getElementById("recommendationDescription");

  toggleButtons(recommendationInformation.isFavorited);

  username.innerText = queriedRecommendation.author.username;
  userCountry.innerText = queriedRecommendation.author.country;
  dateOfRecommendation.innerText = queriedRecommendation.recommendationDate;
  recommendationName.innerText = queriedRecommendation.name;
  recommendationDescription.innerText = queriedRecommendation.description;
}

favoriteButton.addEventListener("click", async function(e){
  console.log("The favorite button was clicked");
  let presentID = player.getVideoData()['video_id'];

  const response = await fetch("/favorited", {
    method : "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body : JSON.stringify({recommendationID:presentID})
  });
  const data = await response.json();
  if ( data.user ) {
    console.log("The recommendation was favorited and added to the user " + data.user);
    toggleButtons(true);
  } else {
    alert("You need to be logged in to add that recommendation to your profile!")
  }
})

unFavoriteButton.addEventListener("click", async function(e){
  console.log("The unfavorite button was clicked");
  let presentID = player.getVideoData()['video_id'];

  const response = await fetch("/unfavorited", {
    method : "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body : JSON.stringify({recommendationID:presentID})
  });
  const data = await response.json();
  if ( data.user ) {
    console.log("The recommendation was removed user " + data.user);
    toggleButtons(false);
  } else {
    alert("You need to be logged in to add that recommendation to your profile!")
  }
})

function toggleButtons (isFavorited) {
  let controlsDiv = document.getElementById("controlsDiv");
  controlsDiv.style.display = "block"
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

async function queryNextRecomendation(displayedID="") {
  console.log("inside the query next recommendation with the following id in the query:" + displayedID);
    let response = await fetch("/nextRecommendationQuery", {
        method : "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({videoID:displayedID, systemStatus:systemStatus})
    });
    let recommendationData = await response.json();
    updateRecommendation(recommendationData);
}

let pastBtn = document.getElementById("pastSpan");
pastBtn.addEventListener("click", async ()=>{
  systemStatus = "past";
  hideFuture();
  showSystemDisplay();
  showPast();
  let response = await fetch("/pastTimeTravel");
  let pastData = await response.json();
  travelToThePast(pastData)
})

let presentBtn = document.getElementById("presentSpan");
presentBtn.addEventListener("click", async ()=>{
  showSystemDisplay();
  systemStatus = "present";
  hideFuture();
  hidePast();
})

let futureBtn = document.getElementById("futureSpan");
futureBtn.addEventListener("click", async () => {
  systemStatus = "future";
  hidePast();
  hideSystemDisplay();
  player.mute();
  showFuture();
  setTimeout(goToTheFuture);
})

let navigationBarElements = document.querySelectorAll(".navigationBar span");
for (let i=0; i< navigationBarElements.length; i++) {
  navigationBarElements[i].onclick = ()=>{
    var c = 0;
    while (c < navigationBarElements.length) {
      navigationBarElements[c++].className = "";
    }
    navigationBarElements[i].className = "activeTense"
  }
}

let infoBtn = document.getElementById("recommendationInfoBtn");
infoBtn.addEventListener("click", ()=>{
  let recommendationInfo = document.getElementById("presentRecommendationInformation");
  if (recommendationInfo.style.display === "none") {
    recommendationInfo.style.display = "block";
  } else {
    recommendationInfo.style.display = "none";
  }
})

function showSystemDisplay() {
  let systemDisplay = document.getElementById("systemDisplay");
  if (systemDisplay.style.display === "none") {
    systemDisplay.style.display = "flex";
    player.unMute();
  } 
}

function hideSystemDisplay() {
  let systemDisplay = document.getElementById("systemDisplay");
  systemDisplay.style.display = "none";
}

function showFuture() {
  let theFuture = document.getElementById("theFuture");
  player.mute();
  if (theFuture.style.display === "none") {
    theFuture.style.display = "block";
  } 
}

function hideFuture() {
  let theFuture = document.getElementById("theFuture")
  if (theFuture.style.display === "block") {
    theFuture.style.display = "none";
  } 
}

function showPast() {
  let thePast = document.getElementById("thePast")
  if (thePast.style.display === "none") {
    thePast.style.display = "block";
  } 
  let pastSpan = document.getElementById("pastSpan");
}

function hidePast() {
  let thePast = document.getElementById("thePast")
  if (thePast.style.display === "block") {
    thePast.style.display = "none";
  } 
}

function travelToThePast(pastData) {
  let pastTableBody = document.getElementById("pastTableBody");
  while (pastTableBody.firstChild){
    pastTableBody.removeChild(pastTableBody.lastChild);
  }
  for (let i=0; i<pastData.pastRecommendations.length; i++){
    var tr = document.createElement('tr');
    var userTd = document.createElement('td');
    userTd.innerText = pastData.pastRecommendations[i].author.username;
    var nameTd = document.createElement('td');
    nameTd.innerText = pastData.pastRecommendations[i].name;
    nameTd.addEventListener("click", ()=>{
      getPastRecommendation(pastData.pastRecommendations[i].youtubeID)
    })
    nameTd.addEventListener("mouseover", (e)=>{
       e.target.style.backgroundColor = 'rgb(' + [123,150,50].join(',') + ')';
    })
    nameTd.addEventListener("mouseout", (e)=>{
      e.target.style.backgroundColor = '';
    })
    tr.appendChild(userTd);
    tr.appendChild(nameTd);
    pastTableBody.appendChild(tr);
  }
  if(pastData.pastRecommendations.length>0){
    let randomRecommendation = pastData.pastRecommendations[(Math.floor(pastData.pastRecommendations.length* Math.random()))]
    let answer = {recommendation : randomRecommendation}
    updateRecommendation(answer);
  } else {
    alert("There are no recommendations in the past!")
  }
}

async function goToTheFuture() {
  let totalFutureDuration;
  let response = await fetch("/getFutureRecommendations");
  let responseJson = await response.json();

  let futureRecommendations = responseJson.futureRecommendations;

  let spaceDiv = document.getElementById("theFuture");
  while (spaceDiv.firstChild) {
    spaceDiv.removeChild(spaceDiv.firstChild);
  }
  
  let timerDisplay = document.createElement("h3");
  let remainingTime = responseJson.futureDuration;

  var days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  var hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

  timerDisplay.innerHTML = "There is enough music in the future for " + days + " days, " + hours + " hours, "
  + minutes + " minutes, " + seconds + " seconds. ";
  let button = document.createElement("button");
  button.innerText = "Add recommendation to the future!"
  button.addEventListener("click", ()=>{
    window.location = "/recommendations/new"
  })

  spaceDiv.appendChild(timerDisplay);
  spaceDiv.appendChild(button);
}

async function getPastRecommendation (youtubeID) {
  let response = await fetch("/getRecommendationInformation", {
    method : "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body : JSON.stringify({recommendationYTID:youtubeID})
  });
  let recommendationData = await response.json();
  updateRecommendation(recommendationData);
}

