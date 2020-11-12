function updateCountdown () {
  let presentTimeSpan = document.getElementById("presentClock");
  presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
}

setInterval(updateCountdown, 1000);