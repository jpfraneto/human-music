window.onload = () => {
  const videoInput = document.getElementById("videoURL");
  console.log("The video input element is: ")
  console.log(videoInput);
  videoInput.onchange = changeVideo;

  remainingRecommendationTime = updateCountdown();
  timer = setInterval(updateCountdown, 1000);
  if(remainingRecommendationTime <= 0){
    window.location.reload()
  } else {
    setTimeout (() => {
      window.location.reload()
  }, remainingRecommendationTime)
  }
}

const favoriteButton = document.getElementById("addFavoriteButton");
const unFavoriteButton = document.getElementById("removeFavoriteButton");
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

toggleButtons();

function toggleButtons () {
  let isFavorited = document.getElementById("isRecommendationFavorited").innerHTML;
  if(isFavorited === "true"){
    favoriteButton.style.display = "none";
    unFavoriteButton.style.display = "inline-block";
  } else {
    favoriteButton.style.display = "inline-block";
    unFavoriteButton.style.display = "none";
  }
}

function updateCountdown () {
  let duration = parseInt(document.getElementById("recommendationDuration").innerHTML);
  let timestamp = parseInt(document.getElementById("startingTimestamp").innerHTML);
  let presentTimestamp = (new Date()).getTime();

  let ms = timestamp + duration - presentTimestamp;

  if (ms > 0){

    let  presentTimeSpan = document.getElementById("presentClock");
    presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
  
    return ms;
  }
}

function changeVideo() {
  const videoInput = document.getElementById("videoURL");
  let url = videoInput.value;
  let videoID = youtube_parser(url);
  if (videoID !== false) {
    checkIfRecommendationIsInDatabase(videoID);
  } else {
    alert("The video url is not valid!");
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

function youtube_parser(url) {
  let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  let match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : false;
};