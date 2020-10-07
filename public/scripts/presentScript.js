window.onload = function() {
  remainingRecommendationTime = updateCountdown();
  //For refreshing the present when the recommendation time is over:
  setTimeout(function() {
    location.reload();
  }, remainingRecommendationTime);
  //For updating the timer that shows how much time is left until the recommendation is changed:
  setInterval(updateCountdown, 1000);
}

function updateCountdown () {
  let duration = parseInt(document.getElementById("recommendationDuration").innerHTML);
  let timestamp = parseInt(document.getElementById("startingTimestamp").innerHTML);
  let presentTimestamp = ( new Date() ).getTime();

  let ms = timestamp + duration - presentTimestamp + 8000;
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
