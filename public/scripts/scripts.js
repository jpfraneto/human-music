setInterval(updateCountdown, 1000);

window.onload = function() {
  //For updating the text on the description as the user writes it down. Read this docummentation for further understanding: https://api.jquery.com/val/
  const textInput = document.getElementById('descriptionTextArea');
  const log = document.getElementById("recommendationDescription");
  
  textInput.addEventListener('beforeinput', updateValue);
  
  function updateValue(e) {
    log.textContent = e.target.value;
  }

  //For changing the video that is shown as soon as the cursor goes away from the input
  const videoInput = document.getElementById("videoURL");

  videoInput.onchange = changeVideo;

  function changeVideo() {
    const videoInput = document.getElementById("videoURL");
    const iFrame = document.getElementById("newRecommendationIframe");
    let url = videoInput.value;
    let videoID = youtube_parser(url);
    if(videoID !== false) {
      iFrame.src = "https://www.youtube.com/embed/" + videoID;
    } else {
      alert("The video url is not valid!");
    }
  }
}

function youtube_parser(url) {
  let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  let match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : false;
};

function changeDateFormat(date){
  let formatedDate = "";
  let day = (date.getDay()<10) ? "0" + date.getDay() : date.getDay();
  formatedDate += day;
  formatedDate += date.getFullYear();
  formatedDate += romanize(date.getMonth());
  return formatedDate;
}

function updateCountdown () {
  let presentTimeSpan = document.getElementById("presentClock");
  presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25)
}