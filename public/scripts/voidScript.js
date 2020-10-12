window.onload = function() {
    remainingRecommendationTime = updateCountdown();
    let voidTimer = setInterval(updateCountdown, 1000);
    setTimeout(function() {
      clearInterval(voidTimer);
      location.reload();
    }, remainingRecommendationTime);
  }
  
  function updateCountdown () {
    let chi = parseInt(document.getElementById("chiDuration").innerHTML);
    let nextTimestamp = parseInt(document.getElementById("nextRecommendationTimestamp").innerHTML);
    let presentTimestamp = ( new Date() ).getTime();
  
    let ms = nextTimestamp - presentTimestamp;
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
  