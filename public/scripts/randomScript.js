const favoriteButton = document.getElementById("addFavoriteButton");
const unFavoriteButton = document.getElementById("removeFavoriteButton");
const favoritesButton = document.getElementById("favoritesButton");

timer = setInterval(updateCountdown, 1000);

async function getSystemInformation () {
    let recommendationID = window.location.pathname.slice(-24);
    let fetchData = {recommendationID:recommendationID};
    const response = await fetch("/showRecommendation", {
      method:"POST",
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(fetchData)
    })
    const recommendationStatus = await response.json();
    return recommendationStatus
}

window.onload = function setup() {
  systemInformationPromise = getSystemInformation();
  systemInformationPromise.then((systemInformation) => {
    toggleButtons(systemInformation.isFavorited);
  })
}

function updateCountdown () {
    let presentTimeSpan = document.getElementById("presentClock");
    presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
}

favoriteButton.addEventListener("click", function(e){
  favoriteButton.style.display = "none";
  unFavoriteButton.style.display = "inline-block";
  let recommendationID = window.location.pathname.slice(-24);
  let fetchData = {recommendationID:recommendationID};
  fetch("/favorited", {
    method:"POST",
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(fetchData)
  })
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
  let recommendationID = window.location.pathname.slice(-24);
  let fetchData = {recommendationID:recommendationID};
  fetch("/unfavorited", {
    method:"POST",
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(fetchData)
  })
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

favoritesButton.addEventListener("click", ()=>{
  alert("You need to be logged in for adding this video into your favorites")
})
  
function toggleButtons (isFavorited) {
  let controlsDiv = document.getElementById("controlsDiv");

  if(isFavorited != null){
    if(isFavorited){
      favoriteButton.style.display = "none";
      unFavoriteButton.style.display = "inline-block";
      console.log("Inside the toggleButtons and the recommendation is favorited");
    } else {
      favoriteButton.style.display = "inline-block";
      unFavoriteButton.style.display = "none";
    }
  }
  controlsDiv.style.visibility = "visible";
}

