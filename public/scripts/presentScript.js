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

function updateCountdown () {
  let duration = parseInt(document.getElementById("recommendationDuration").innerHTML);
  let timestamp = parseInt(document.getElementById("startingTimestamp").innerHTML);
  let presentTimestamp = (new Date()).getTime();

  let ms = timestamp + duration - presentTimestamp;

  if (ms > 0){

    let  presentTimeSpan = document.getElementById("presentTime");
    presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
  
    return ms;
  }
}
