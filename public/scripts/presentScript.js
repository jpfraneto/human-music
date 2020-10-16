window.onload = () => {
  remainingRecommendationTime = updateCountdown();
  timer = setInterval(updateCountdown, 1000);
  setTimeout (() => {
    clearInterval(timer);
    let countdownClockDiv = document.getElementById("countdownClockDiv");
    countdownClockDiv.innerHTML = "";
    let aTag = document.createElement("a");
    aTag.setAttribute("href", "https://www.human-music.com");
    aTag.setAttribute("class", "countdownClock");
    aTag.innerText = "The recommendation is over, click here to refresh the page";
    countdownClockDiv.appendChild(aTag);
  }, remainingRecommendationTime)
}

function updateCountdown () {
  let duration = parseInt(document.getElementById("recommendationDuration").innerHTML);
  let timestamp = parseInt(document.getElementById("startingTimestamp").innerHTML);
  let presentTimestamp = ( new Date() ).getTime();

  let ms = timestamp + duration - presentTimestamp;

  if (ms > 0){
    let s = (ms/1000);

    let seconds = Math.floor(s % 60);
    let hours = Math.floor(s / 3600);
    let minutes = Math.floor((s/60) % 60);
  
    let displayHours = (hours < 10) ? "0" + hours : hours;
    let displayMinutes = (minutes < 10 ) ?  "0" + minutes : minutes;
    let displaySeconds = (seconds < 10 ) ? "0" + seconds : seconds;
  
    let remainingHours = document.getElementById("remainingHours");
    remainingHours.innerHTML = displayHours;
    let remainingMinutes = document.getElementById("remainingMinutes");
    remainingMinutes.innerHTML = displayMinutes;
    let remainingSeconds = document.getElementById("remainingSeconds");
    remainingSeconds.innerHTML = displaySeconds;
  
    return ms;

  }
}
