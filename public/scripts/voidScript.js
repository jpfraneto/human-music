window.onload = () => {
  const videoInput = document.getElementById("videoURL");
  videoInput.onchange = changeVideo;

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

function changeVideo() {
  const videoInput = document.getElementById("videoURL");
  let url = videoInput.value;
  let videoID = youtube_parser(url);
  if (videoID !== false) {
    checkIfRecommendationIsInDatabase(videoID);
  } else {
    alert("The video url is not valid!");
  }
}

async function checkIfRecommendationIsInDatabase(videoID){
  const response = await fetch("/checkIfRepeated", {
    method : "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body : JSON.stringify({videoID:videoID})
  });
  const data = await response.json();
  if(data.isRepeated){
    alert("Holy shit! That video was already recommended by @" + data.author.username)
  }
}

function youtube_parser(url) {
  let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  let match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : false;
};