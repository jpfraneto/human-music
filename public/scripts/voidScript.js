window.onload = () => {
  let information = getSystemInformation();
  information.then((systemInformation)=>{
    let now = (new Date).getTime();
    let delay = systemInformation.nextEventStartingTimestamp - now;
    setTimeout (reloadVoid, delay);
  })
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

function updateVoid () {
  let nasaData = getNasaData()
  //Set the parameters for the void image
}

async function getSystemInformation () {
  const response = await fetch("/checkSystemStatus");
  const presentStatus = await response.json();
  return presentStatus
}