let nextDayStartingTimestamp;
let thisDayStartingTimestamp;

window.onload = () => {
  systemInformationPromise = getSystemInformation();
  systemInformationPromise.then((systemInformation) => {
    let now = (new Date).getTime();
    delay = systemInformation.dayStartTimestamp + 86400000 - now;
    setTimeout (() => {
      window.location.reload()
    }, delay);
  })
}

async function getSystemInformation () {
  const response = await fetch("/checkSystemStatus");
  const presentStatus = await response.json();
  return presentStatus
}
  
function updateClock () {
    let  presentTimeSpan = document.getElementById("presentTime");
    presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25);
}
  