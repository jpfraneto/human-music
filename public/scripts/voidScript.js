window.onload = () => {
  remainingVoidTime = updateClock();
  timer = setInterval(updateClock, 1000);
  if(remainingVoidTime>0){
    setTimeout (() => {
      clearInterval(timer);
      window.location.reload()
    }, remainingVoidTime);
  } else {
    let endingVoidTag = document.getElementById("endingVoidTag");
    endingVoidTag.innerHTML = "";
    let aTag = document.createElement("a");
    aTag.setAttribute("href", "https://www.human-music.com");
    aTag.setAttribute("class", "content");
    aTag.innerText = "The interval between recommendations is over, click here to refresh the page";
    endingVoidTag.appendChild(aTag);
  }
}

function updateClock () {
  let  presentTimeSpan = document.getElementById("presentClock");
  presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25);

  let remainingVoidTime = parseInt(document.getElementById("remainingVoidTime").innerHTML);
  return remainingVoidTime;
}
