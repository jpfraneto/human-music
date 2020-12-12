window.onload = () => {
  setInterval(updateCountdown, 1000);
  let information = getSystemInformation();
  information.then((systemInformation)=>{
    let now = (new Date).getTime();
    let delay = systemInformation.nextEventStartingTimestamp - now;
    console.log("We are in the void, the window will be refreshed in " + delay + " milliseconds");
    setTimeout (reloadVoid, delay);
  })
}

function updateCountdown () {
  let presentTimeSpan = document.getElementById("presentClock");
  presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
}

async function reloadVoid () {
  let info = getSystemInformation();
  info.then((newInfo)=>{
    if(newInfo.systemStatus === "recommendation"){
      window.location.reload();
    } else {
      reloadVoid();
    }
    });
}

async function getSystemInformation () {
  const response = await fetch("/checkSystemStatus");
  const presentStatus = await response.json();
  return presentStatus
}