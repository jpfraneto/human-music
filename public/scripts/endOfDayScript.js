let nextDayStartingTimestamp;
let thisDayStartingTimestamp;

window.onload = () => {
  setTimeout (() => {
    window.location.reload()
  }, 5000);
}
  
function updateClock () {
    let  presentTimeSpan = document.getElementById("presentTime");
    presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25);
}
  