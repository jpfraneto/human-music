window.onload = () => {
  remainingRecommendationTime = updateCountdown();
  timer = setInterval(updateCountdown, 1000);
  setTimeout (() => {
    clearInterval(timer);
    let endingTimeTag = document.getElementById("endingTimeTag");
    endingTimeTag.innerHTML = "";
    let aTag = document.createElement("a");
    aTag.setAttribute("href", "https://www.human-music.com");
    aTag.setAttribute("class", "content");
    aTag.innerText = "The recommendation is over, click here to refresh the page";
    endingTimeTag.appendChild(aTag);
  }, remainingRecommendationTime)
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

function bookmark () {
  alert("This button is for bookmarking the recommendation. I'm working for having this functionality ready!")
}