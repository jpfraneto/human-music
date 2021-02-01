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
  queriedRecommendation = recommendationInformation.recommendation;
  player.loadVideoById(queriedRecommendation.youtubeID, recommendationInformation.elapsedSeconds);
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

let newRecommendationBtn = document.getElementById("addRecommendationBtn");
newRecommendationBtn.addEventListener("click", (e)=>{
  e.preventDefault();
  let modal = document.getElementById("recommendationModal");
  modal.style.display = "block";
  let youtubeInput = document.getElementById("videoURL");
  youtubeInput.addEventListener('blur', () => {
    let youtubeID = (getYoutubeID(youtubeInput.value));
    if(youtubeID.length !== 11){
      alert("That URL is not valid, please try a new one.");
    } else {
      console.log("The link works, and the youtube ID is: " + youtubeID); 
    }
  });
  let closeModalBtn = document.getElementById("closeModalBtn");
  closeModalBtn.addEventListener("click", ()=>{
    document.getElementById("modalResponse").style.display = "none";
    modal.style.display = "none"
    // document.getElementById("recommendationIframeSpan").src = "";
  })
  window.onclick = (e) => {
    if(e.target == modal) {
      document.getElementById("modalResponse").style.display = "none";
      modal.style.display = "none"
      // document.getElementById("recommendationIframeSpan").src = "";
    }
  }
  let previewBtn = document.getElementById("previewBtn");
  previewBtn.addEventListener("click", ()=>{
    updateModalPreview()
  });
})

async function updateModalPreview (){
  let iFrame = document.getElementById("recommendationIframeSpan");
  let usernameSpan = document.getElementById("usernameSpan");
  let countrySpan = document.getElementById("countrySpan");
  let descriptionSpan = document.getElementById("descriptionSpan");
  let userData;
  if (document.getElementById("username") && document.getElementById("country")){
    usernameSpan.innerText = document.getElementById("usernameInput").value;
    countrySpan.innerText = document.getElementById("country").value;
  } else {
    const response = await fetch("/getUserInfo");
    userData = await response.json();
    usernameSpan.innerText = userData.username;
    countrySpan.innerText = userData.country;
  }
  descriptionSpan.innerText = document.getElementById("descriptionTextArea").value;
  let wasCreatedByUser = document.getElementById("userCheckbox").value;
  let youtubeID = getYoutubeID(document.getElementById("videoURL").value)
  iFrame.src = "https://www.youtube.com/embed/" + youtubeID + "?autoplay=1";

  let modalInput = document.getElementById("modalInput");
  modalInput.style.display = "none";
  let modalPreview = document.getElementById("modalPreview")
  modalPreview.style.display = "block";
  let editBtn = document.getElementById("editBtn");
  editBtn.addEventListener("click", ()=>{
    modalInput.style.display = "block";
    modalPreview.style.display = "none";
    iFrame.src = "";
  });
  let submitBtn = document.getElementById("submitBtn");
  let modalResponse = document.getElementById("modalResponse");
  let closeModalBtn2 = document.getElementById("closeButtonInResponseModal");
  let modal = document.getElementById("recommendationModal");
  closeModalBtn2.addEventListener("click", ()=>{
    modalInput.style.display = "block";
    document.getElementById("responseFromServer").innerText = "The recommendation is being sent to the future...";
    modalResponse.style.display = "none";
    modal.style.display = "none";
  })
  submitBtn.addEventListener("click", async ()=>{
    modalPreview.style.display = "none";
    modalResponse.style.display = "block";
    let response = "";
    let saveRecommendationQuery = await fetch("/", {
      method : "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body : JSON.stringify({newRecommendationID:youtubeID, description:descriptionSpan.innerText, username:usernameSpan.innerText, country:countrySpan.innerText, wasCreatedByUser:wasCreatedByUser})
    });
    response = await saveRecommendationQuery.json();
    
    let responseFromServer = document.getElementById("responseFromServer");
    responseFromServer.innerText = response.answer;
    clearModal();
  })
}

function clearModal () {
  if(document.getElementById("usernameInput") && document.getElementById("country")){
    document.getElementById("usernameInput").value = "";
    document.getElementById("country").value = "";
  }
  document.getElementById("videoURL").value = "";
  document.getElementById("descriptionTextArea").value = "";
  document.getElementById("recommendationIframeSpan").src = "";
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
    let presentID = player.getVideoData()['video_id']
    if(recommendationData.recommendation.youtubeID !== presentID){
      updateRecommendation(recommendationData);
    }
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
  queryNextRecomendation();
})

let futureBtn = document.getElementById("futureSpan");
futureBtn.addEventListener("click", async () => {
  systemStatus = "future";
  hidePast();
  hideSystemDisplay();
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

  spaceDiv.appendChild(timerDisplay);
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