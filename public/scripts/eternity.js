let systemInformation, iFrameGlobalElement, delay, recommendationInfo, voidInfo, currentUser;

const favoriteButton = document.getElementById("addFavoriteButton");
const unFavoriteButton = document.getElementById("removeFavoriteButton");
const favoritesButton = document.getElementById("favoritesButton");
let systemStatus = "present";
let recommmendationType = "music";

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
        setTimeout(()=>{
            queryNextRecomendation(displayedID);
        }, 1618)
    } 
}

function updateRecommendation (recommendationInformation) {
  queriedRecommendation = recommendationInformation.recommendation;
  player.loadVideoById(queriedRecommendation.youtubeID, recommendationInformation.elapsedSeconds);

  let username = document.getElementById("username");
  username.innerText = queriedRecommendation.author.username;

  let userCountry = document.getElementById("userCountry");
  userCountry.innerText = queriedRecommendation.author.country;

  let dateOfRecommendation = document.getElementById("dateOfRecommendation");
  dateOfRecommendation.innerText = queriedRecommendation.recommendationDate;

  let recommendationName = document.getElementById("recommendationName");
  recommendationName.innerText = queriedRecommendation.name;

  let recommendationDescription = document.getElementById("recommendationDescription");
  recommendationDescription.innerText = queriedRecommendation.description;

  toggleButtons(recommendationInformation.isFavorited);
}

favoriteButton.addEventListener("click", async function(e){
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
    toggleButtons(true);
  } else {
    alert("You need to be logged in to add that recommendation to your profile!")
  }
})

unFavoriteButton.addEventListener("click", async function(e){
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
    toggleButtons(false);
  } else {
    alert("You need to be logged in to add that recommendation to your profile!")
  }
})

function toggleButtons (isFavorited) {
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
    alert("What a coincidence! That video was already recommended by @" + data.author.username)
  }
}

async function queryNextRecomendation(displayedID="") {
  console.log("inside the query next recommendaiton function " + displayedID);
    let response = await fetch("/nextRecommendationQuery", {
        method : "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({videoID:displayedID, systemStatus:systemStatus})
    });
    let recommendationData = await response.json();
    let presentID = player.getVideoData()['video_id']
    if(recommendationData.recommendation.youtubeID !== presentID){
      updateRecommendation(recommendationData);
    }
}

let pastBtn = document.getElementById("pastSpan");
pastBtn.addEventListener("click", async ()=>{
  systemStatus = "past";
  showSystemDisplay();
  showPast();
  travelToThePast();
})

let presentBtn = document.getElementById("presentSpan");
presentBtn.addEventListener("click", async ()=>{
  systemStatus = "present";
  showSystemDisplay();
  hidePast();
  queryNextRecomendation();
})

let futureBtn = document.getElementById("futureSpan");
futureBtn.addEventListener("click", ()=>{
  window.open("https://future.human-music.com");
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

let randomRecommendationBtn = document.getElementById("randomRecommendationBtn");
randomRecommendationBtn.addEventListener("click", async () => {
  let response = await fetch("/randomRecommendation");
  let queryResponse = await response.json();
  updateRecommendation(queryResponse);
});

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

function showPast() {
  let thePast = document.getElementById("thePast")
  let pastButtons = document.getElementById("pastButtons");
  if (thePast.style.display === "none") {
    thePast.style.display = "block";
    pastButtons.style.display = "inline";
  } 
  let pastLoading = document.getElementById("pastLoading");
  pastLoading.style.display = "block";
}

function hidePast() {
  let thePast = document.getElementById("thePast")
  let pastButtons = document.getElementById("pastButtons");
  if (thePast.style.display === "block") {
    thePast.style.display = "none";
    pastButtons.style.display = "none";
  } 
}

async function travelToThePast() {
  let response = await fetch("/pastTimeTravel");
  let pastData = await response.json();
  let pastTableBody = document.getElementById("pastTableBody");
  while (pastTableBody.firstChild){
    pastTableBody.removeChild(pastTableBody.lastChild);
  }
  for (let i=0; i<pastData.pastRecommendations.length; i++){
    var tr = document.createElement('tr');
    var indexTd = document.createElement('td');
    indexTd.innerText = pastData.pastRecommendations[i].index;
    var userTd = document.createElement('td');
    userTd.innerText = pastData.pastRecommendations[i].author.username;
    var nameTd = document.createElement('td');
    nameTd.innerText = pastData.pastRecommendations[i].name;
    nameTd.addEventListener("click", ()=>{
      getPastRecommendation(pastData.pastRecommendations[i].youtubeID);
      window.scrollTo(0, 0);
    })
    nameTd.addEventListener("mouseover", (e)=>{
       e.target.style.backgroundColor = 'rgb(' + [123,150,50].join(',') + ')';
    })
    nameTd.addEventListener("mouseout", (e)=>{
      e.target.style.backgroundColor = '';
    })
    var durationTd = document.createElement('td');
    durationTd.innerText = durationFormatting(pastData.pastRecommendations[i].duration);
    tr.appendChild(indexTd);
    tr.appendChild(userTd);
    tr.appendChild(nameTd);
    tr.appendChild(durationTd);
    pastTableBody.appendChild(tr);
  }
  sortTable(0, "desc");
  pastTableBody.scrollIntoView();
  let pastLoading = document.getElementById("pastLoading");
  pastLoading.style.display = "none";
  let pastTableSpan = document.getElementById("pastTableSpan");
  pastTableSpan.style.display = "block";
}

async function getPastRecommendation (youtubeID) {
  let response = await fetch("/getRecommendationInformation", {
    method : "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body : JSON.stringify({recommendationID:youtubeID})
  });
  let recommendationData = await response.json();
  updateRecommendation(recommendationData);
}

function sortTable(n, dir="asc") {
  let table, rows, switching, i, x, y, a, b, shouldSwitch, switchCount = 0;
  table = document.getElementById("pastTable");
  switching = true;
  while (switching) {
      switching = false;
      rows = table.rows;
      for (i=1 ; i<(rows.length - 1); i++) {
          shouldSwitch = false;
          x = rows[i].getElementsByTagName("td")[n];
          y = rows[i+1].getElementsByTagName("td")[n];
          a = isNaN(parseInt(x.innerHTML))?x.innerHTML.toLowerCase():parseInt(x.innerHTML);
          b = isNaN(parseInt(y.innerHTML))?y.innerHTML.toLowerCase():parseInt(y.innerHTML);
          if (dir == "asc") {
              if (a > b){
                  shouldSwitch = true;
                  break
              }
          } else if (dir == "desc") {
              if (a < b){
                  shouldSwitch = true;
                  break
              }
          }
      }
      if (shouldSwitch) {
          rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
          switching = true;
          switchCount ++;
      } else {
          if (switchCount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
          }
      }
  }
}

function durationFormatting (milliseconds){
  let seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  let hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));;
  if(hours < 10){hours = "0" + hours;};
  if(minutes < 10){minutes = "0" + minutes;};
  if(seconds < 10){seconds = "0" + seconds;};
  return hours + ':' + minutes + ':' + seconds;
}

function getYoutubeID(url){
  url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return undefined !== url[2]?url[2].split(/[^0-9a-z_\-]/i)[0]:url[0];
}


