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

function romanize (num) {
  if (isNaN(num))
      return NaN;
  let digits = String(+num).split(""),
      key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
             "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
             "","I","II","III","IV","V","VI","VII","VIII","IX"],
      roman = "",
      i = 3;
  while (i--)
      roman = (key[+digits.pop() + (i * 10)] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;
}

function remainingRecommendationTime (){
  let date = new Date;
  let presentTimestamp = date.getTime();
};

function goSomewhereRandom () {
  const urls = ["https://www.google.com", 
  "https://www.utne.com", 
  "https://www.theatlantic.com",
  "https://www.patatap.com/",
  "https://news.ycombinator.com/",
  "https://stratechery.com/",
  "https://www.4alltech.com/",
  "https://www.theguardian.com"];

  const randomUrl = urls[Math.floor(Math.random() * urls.length)];

  window.location.href = randomUrl;
}