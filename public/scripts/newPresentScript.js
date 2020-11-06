window.onload = () => {

};

async function initialize () {
  let systemInfo = await getSystemInformation();
  if (systemInfo.systemStatus === "film") {
    setTimeout(()=>{
      let container = document.getElementById("mediaContainer");
      document.getElementById("filmImage").remove();
      let newImage = document.createElement("img");
      newImage.id = "voidImage";
      newImage.src = "https://images.unsplash.com/photo-1546569397-ab326af881f5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=326&q=80";
      container.appendChild(newImage);
      let remainingVoidTime = 6000;
      setTimeout(()=>{
        newImage.remove();
        initializeIframe(systemInfo);
      },5000)
    }, 3000)
  } else if (systemInfo.systemStatus === "recommendation") {
    initializeIframe(systemInfo);
    setTimeout(intoTheVoid, systemStatus.nextEventDelay)
  } else if (systemInfo.systemStatus === "void") {
    setTimeout(outOfTheVoid, systemStatus.nextEventDelay)
  } else if (systemInfo.systemStatus === "endOfDay") {
    setTimeout(endOfDay, systemStatus.nextEventDelay) 
  }
}

initialize();

async function getSystemInformation () {
  console.log("inside the getSystemInformation function")
  const response = await fetch("/checkSystemStatus");
  const presentStatus = await response.json();
  return presentStatus
}

function initializeIframe(systemInfo) {
  let newIframe = document.createElement('iframe');
  newIframe.setAttribute('id', 'presentPlayer'); // assign an id
  let embed = "https://www.youtube.com/embed/" + systemInfo.recommendation.youtubeID + "?start="+ systemInfo.elapsedTime + "&autoplay=1&enablejsapi=1&mute=1&controls=0"
  newIframe.setAttribute('src', embed);
  let container = document.getElementById("mediaContainer");
  container.appendChild(newIframe);

  let player, iframe;
  var tag = document.createElement('script');
  tag.id = 'iframe-demo';
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  function onYouTubeIframeAPIReady() {
    console.log("The youtube api is ready");
      player = new YT.Player('presentPlayer', { 
          videoId : systemInfo.recommendation.youtubeID,
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

}

function showRecommendationInformation () {
  let infoDiv = document.getElementById("presentRecommendationInformation");
  infoDiv.className = "recommendationInformationDisplay"
}

function intoTheVoid () {
  let container = document.getElementById("mediaContainer");
  let newImage = document.createElement("img");
  newImage.id = "voidImage";
  newImage.src = "https://images.unsplash.com/photo-1546569397-ab326af881f5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=326&q=80";

  iFrameGlobalElement = null;
  iFrameGlobalElement = $("#player").detach();
  
  container.appendChild(newImage);

  let remainingVoidTime = 6000;
  
  setTimeout(outOfTheVoid, remainingVoidTime);
}

function outOfTheVoid () {
  let container = document.getElementById("mediaContainer");
  let voidImage = document.getElementById("voidImage");
  voidImage.remove();
  
  let youtubeIDs = ["Cg5J6Eo_3H0", "cVFzblT5VPE", "SZMb2cxN42o", "Pk4mlxY2row", "rv4wf7bzfFE", "cPNU9jxkiY4"];
  let youtubeID = youtubeIDs[Math.floor(Math.random() * youtubeIDs.length)];

  iFrameGlobalElement.appendTo(container);
  let iFrame = document.querySelector("iframe");

  iFrame.src = "https://www.youtube.com/embed/" + youtubeID + "?start=0&autoplay=1&enablejsapi=1&controls=0";

  let duration = 5000;
  setTimeout(intoTheVoid, duration);
}

function newDayStart () {
  let container = document.getElementById("mediaContainer");
  let voidImage = document.getElementById("voidImage");
  voidImage.remove();
  
  let youtubeIDs = ["Cg5J6Eo_3H0", "cVFzblT5VPE", "SZMb2cxN42o", "Pk4mlxY2row", "rv4wf7bzfFE", "cPNU9jxkiY4"];
  let youtubeID = youtubeIDs[Math.floor(Math.random() * youtubeIDs.length)];

  iFrameGlobalElement.appendTo(container);
  let iFrame = document.querySelector("iframe");

  iFrame.src = "https://www.youtube.com/embed/" + youtubeID + "?start=0&autoplay=1&enablejsapi=1&controls=0";

  let duration = 5000;
  setTimeout(intoTheVoid, duration);
}

function updateRecommendationCounter () {
  //Check out how long until the recommendation is over
  //setTimeout(intoTheVoid, remainingRecommendationTime)
}

function changeFrame () {
  // Change the iFrame for a img and viceversa
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

async function getRecommendation(){
  const sendData = {};
  const response = await fetch("/getRecommendation", {
    method : "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body : JSON.stringify(sendData)
  });
  const presentRecommendation = await response.json();
  updateRecommendation(presentRecommendation);
}
