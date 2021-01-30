let systemInformation, delay, recommendationInfo, voidInfo, currentUser;

let playedRecommendations = []
let bottomMessage = document.getElementById("recommendationBottomMessage");

window.onload = (e)=> {
  console.log("Inside the window.onload function")
  showPast();
}

let player, iframe;
var tag = document.createElement('script');
tag.id = 'iframe-demo';
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  player = new YT.Player('presentPlayer', { 
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
  });
}

function onPlayerReady(event) {
  let presentID = player.getVideoData()['video_id']
  console.log("The presentID is: " + presentID);
}

function onPlayerError(event) {
    console.log("There was an error with the player!")
}

function onPlayerStateChange(event) {
    //Do something when the player state changes. When the video is over, update it with the next one.
    let displayedID = player.getVideoData()['video_id']
    if (event.data === 0) {
      console.log("The video ended and now the set Timeout will bring the next recommendation")
        setTimeout(()=>{
            queryNextRecomendation(displayedID);
        }, 1618)
    } 
}

function updateRecommendation (recommendation) {
  player.loadVideoById(recommendation.youtubeID);
  voidInfo = document.getElementById("voidInformation");

  let username = document.getElementById("username");
  let userCountry = document.getElementById("userCountry");
  let dateOfRecommendation = document.getElementById("dateOfRecommendation");
  let recommendationName = document.getElementById("recommendationName");
  let recommendationDescription = document.getElementById("recommendationDescription");

  username.innerText = recommendation.author.username;
  userCountry.innerText = recommendation.author.country;
  dateOfRecommendation.innerText = recommendation.recommendationDate;
  recommendationName.innerText = recommendation.name;
  recommendationDescription.innerText = recommendation.description;
}

async function queryNextRecomendation(displayedID="") {
    console.log("inside the query next recommendation with the following id in the query:" + displayedID);
    playedRecommendations.push(displayedID);
    let response = await fetch("/getFavoriteRecommendations");
    let favoriteRecommendations = await response.json();
    
    let randomRecommendation = favoriteRecommendations[Math.floor(Math.random()*favoriteRecommendations.length)]
    
    updateRecommendation(randomRecommendation);
}

let infoBtn = document.getElementById("recommendationInfoBtn");
infoBtn.addEventListener("click", ()=>{
  let recommendationInfo = document.getElementById("presentRecommendationInformation");
  if (recommendationInfo.style.display === "none") {
    recommendationInfo.style.display = "block";
  } else {
    recommendationInfo.style.display = "none";
  }
})


async function showPast() {
    let response = await fetch("/getFavoriteRecommendations");
    let favoriteRecommendations = await response.json();
    console.log(favoriteRecommendations);

    let thePast = document.getElementById("thePast")
    let pastTableBody = document.getElementById("pastTableBody");
    while (pastTableBody.firstChild){
      pastTableBody.removeChild(pastTableBody.lastChild);
    }
    for (let i=0; i<favoriteRecommendations.length; i++){
      var tr = document.createElement('tr');
      var userTd = document.createElement('td');
      userTd.innerText = favoriteRecommendations[i].author.username;
      var nameTd = document.createElement('td');
      nameTd.innerText = favoriteRecommendations[i].name;
      let recommendation = favoriteRecommendations[i];
      nameTd.addEventListener("click", ()=>{
        updateRecommendation(recommendation);
        window.scrollTo(0, 0);
      })
      nameTd.addEventListener("mouseover", (e)=>{
         e.target.style.backgroundColor = 'rgb(' + [123,150,50].join(',') + ')';
      })
      nameTd.addEventListener("mouseout", (e)=>{
        e.target.style.backgroundColor = '';
      })
      var durationTd = document.createElement('td');
      durationTd.innerText = durationFormatting(favoriteRecommendations[i].duration);
      tr.appendChild(userTd);
      tr.appendChild(nameTd);
      tr.appendChild(durationTd);
      pastTableBody.appendChild(tr);
    }
    sortTable(0, "desc");
    thePast.style.display = "block";
    pastTableBody.scrollIntoView();
}

let nextRecommendationBtn = document.getElementById("nextRecommendation");
nextRecommendationBtn.addEventListener("click", ()=>{
    let displayedID = player.getVideoData()['video_id']
    queryNextRecomendation(displayedID);
})

function sortTable(n, dir="asc") {
  let table, rows, switching, i, x, y, shouldSwitch, switchCount = 0;
  table = document.getElementById("pastTable");
  switching = true;
  while (switching) {
      switching = false;
      rows = table.rows;
      for (i=1 ; i<(rows.length - 1); i++) {
          shouldSwitch = false;
          x = rows[i].getElementsByTagName("td")[n];
          y = rows[i+1].getElementsByTagName("td")[n];
          if (dir == "asc") {
              if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()){
                  shouldSwitch = true;
                  break
              }
          } else if (dir == "desc") {
              if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()){
                  shouldSwitch = true;
                  break
              }
          }
      }
      if (shouldSwitch) {
          rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
          switching = true;
          switchCount ++;
      } else {
          if (switchCount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
          }
      }
  }
}

function durationFormatting (milliseconds){
  let seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  let hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));;
  if(hours < 10){hours = "0" + hours;};
  if(minutes < 10){minutes = "0" + minutes;};
  if(seconds < 10){seconds = "0" + seconds;};
  return hours + ':' + minutes + ':' + seconds;
}