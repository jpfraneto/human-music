window.onload = () => {
  let information = getSystemInformation();
  information.then((systemInformation)=>{
    setTimeout (() => {
      window.location.reload()
    }, systemInformation.nextEventDelay);
  })
}

async function getNasaData () {
  console.log("inside the getNasaData function")
  // const response = await fetch("/checkSystemStatus");
  // const presentStatus = await response.json();
  return nasaData
}

function updateVoid () {
  let nasaData = getNasaData()
  //Set the parameters for the void image
}

async function getSystemInformation () {
  console.log("inside the getSystemInformation function")
  const response = await fetch("/checkSystemStatus");
  const presentStatus = await response.json();
  return presentStatus
}