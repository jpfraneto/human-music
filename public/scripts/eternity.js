let systemInformation,
  iFrameGlobalElement,
  delay,
  recommendationInfo,
  voidInfo,
  currentUser;

const favoriteButton = document.getElementById('addFavoriteButton');
const unFavoriteButton = document.getElementById('removeFavoriteButton');
const favoritesButton = document.getElementById('favoritesButton');

let btnSetup = false;
let systemStatus = 'present';
let recommmendationType = 'music';

let player, iframe;
var tag = document.createElement('script');
tag.id = 'iframe-demo';
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  player = new YT.Player('presentPlayer', {
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
}

function onPlayerReady(event) {
  let presentID = player.getVideoData()['video_id'];
  showControls(presentID);
}

async function showControls(youtubeID) {
  let response = await fetch('/getRecommendationInformation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recommendationID: youtubeID }),
  });
  let recommendationData = await response.json();
  toggleButtons(recommendationData.isFavorited);
}

function onPlayerError(event) {
  console.log('There was an error with the player!');
}

function onPlayerStateChange(event) {
  //When the video is over, update it with the next one.
  let displayedID = player.getVideoData()['video_id'];
  if (event.data === 0) {
    setTimeout(() => {
      queryNextRecomendation(displayedID);
    }, 0);
  }
}

function updateRecommendation(recommendationInformation) {
  queriedRecommendation = recommendationInformation.recommendation;
  player.loadVideoById(
    queriedRecommendation.youtubeID,
    recommendationInformation.elapsedSeconds
  );
  if (recommendationInformation.recommendation.status === 'past') {
    player.seekTo(0);
  }

  let userCountry = document.getElementById('userCountry');
  userCountry.innerText = queriedRecommendation.author.country;

  let recommenderName = document.getElementById('recommenderName');
  recommenderName.innerText = queriedRecommendation.author.name;

  let recommendationName = document.getElementById('recommendationName');
  recommendationName.innerText = queriedRecommendation.name;

  let recommendationDescription = document.getElementById(
    'recommendationDescription'
  );
  recommendationDescription.innerText = queriedRecommendation.description;

  toggleButtons(recommendationInformation.isFavorited);
  clearRecommendationComments();
  queriedRecommendation.comments.forEach(comment => {
    addNewCommentToDisplay(comment);
  });
}

async function checkIfRecommendationIsInDatabase(videoID) {
  const response = await fetch('/checkIfRepeated', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoID: videoID }),
  });
  const data = await response.json();
  if (data.isRepeated) {
    alert(
      'What a coincidence! That video was already recommended by ' +
        data.author.name
    );
  }
}

async function queryNextRecomendation(displayedID = '') {
  let response = await fetch('/nextRecommendationQuery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoID: displayedID, systemStatus: systemStatus }),
  });
  let recommendationData = await response.json();
  let presentID = player.getVideoData()['video_id'];
  if (recommendationData.recommendation.status === 'present') {
    recommendationData.elapsedSeconds =
      (new Date().getTime() -
        recommendationData.recommendation.startingRecommendationTimestamp) /
      1000;
  }
  if (recommendationData.recommendation.youtubeID !== presentID) {
    recommendationData.elapsedSeconds = 0;
    updateRecommendation(recommendationData);
  }
}

let presentBtn = document.getElementById('presentSpan');
presentBtn.addEventListener('click', async () => {
  systemStatus = 'present';
  showSystemDisplay();
  hideUser();
  queryNextRecomendation();
  hideSupport();
  document.getElementById('recommendationFrame').style.display = 'block';
});

let supportBtn = document.getElementById('supportSpan');
supportBtn.addEventListener('click', () => {
  hideUser();
  document.getElementById('theSupport').style.display = 'block';
  document.getElementById('recommendationFrame').style.display = 'none';
});

let loginBtn = document.getElementById('loginSpan');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    window.location.href = 'https://www.humanmusic.xyz/login';
  });
}

let logoutBtn = document.getElementById('logoutSpan');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    window.location.href = 'https://www.humanmusic.xyz/logout';
  });
}

let userBtn = document.getElementById('loggedUserSpan');
if (userBtn) {
  userBtn.addEventListener('click', async () => {
    showSystemDisplay();
    showUser();
    travelToTheUser('favorites');
    document.getElementById('userFavoritesSpan').className = 'activeTense';
    document.getElementById('userRecommendationsSpan').className = '';
    hideSupport();
    document.getElementById('recommendationFrame').style.display = 'none';
  });
}

function hideSupport() {
  let theSupport = document.getElementById('theSupport');
  if (theSupport.style.display === 'block') {
    theSupport.style.display = 'none';
  }
}

let navigationBarElements = document.querySelectorAll('.headerBanner span');
for (let i = 0; i < navigationBarElements.length; i++) {
  navigationBarElements[i].onclick = () => {
    var c = 0;
    while (c < navigationBarElements.length) {
      navigationBarElements[c++].className = '';
    }
    navigationBarElements[i].className = 'activeTense';
  };
}

let infoBtn = document.getElementById('recommendationInfoBtn');
infoBtn.addEventListener('click', () => {
  let recommendationInfo = document.getElementById(
    'presentRecommendationInformation'
  );
  if (recommendationInfo.style.display === 'none') {
    recommendationInfo.style.display = 'block';
    infoBtn.classList.toggle('activeTense');
  } else {
    recommendationInfo.style.display = 'none';
    infoBtn.classList.toggle('activeTense');
  }
});

let randomRecommendationBtn = document.getElementById(
  'randomRecommendationBtn'
);
randomRecommendationBtn.addEventListener('click', async () => {
  let response = await fetch('/randomRecommendation');
  let queryResponse = await response.json();
  updateRecommendation(queryResponse);
});

function showSystemDisplay() {
  let systemDisplay = document.getElementById('systemDisplay');
  if (systemDisplay.style.display === 'none') {
    systemDisplay.style.display = 'flex';
    player.unMute();
  }
}

function hideSystemDisplay() {
  let systemDisplay = document.getElementById('systemDisplay');
  systemDisplay.style.display = 'none';
}

async function getPastRecommendation(youtubeID) {
  let response = await fetch('/getRecommendationInformation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recommendationID: youtubeID }),
  });
  let recommendationData = await response.json();
  updateRecommendation(recommendationData);
  document.getElementById('recommendationFrame').style.display = 'block';
}

//************* */
function showUser() {
  let theUser = document.getElementById('theUser');
  if (theUser.style.display === 'none') {
    theUser.style.display = 'block';
  }
}

function hideUser() {
  let theUser = document.getElementById('theUser');
  if (theUser.style.display === 'block') {
    theUser.style.display = 'none';
  }
}

let userButtonElements = document.querySelectorAll('.userButtons span');
for (let i = 0; i < userButtonElements.length; i++) {
  userButtonElements[i].onclick = () => {
    var c = 0;
    while (c < userButtonElements.length) {
      userButtonElements[c++].className = '';
    }
    userButtonElements[i].className = 'activeTense';
  };
}

async function travelToTheUser(queryType) {
  systemStatus = queryType;
  document.getElementById('userTable').style.display = 'none';
  let response = await fetch('/userTimeTravel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userQuery: queryType }),
  });

  let userData = await response.json();
  let userTableBody = document.getElementById('userTableBody');
  while (userTableBody.firstChild) {
    userTableBody.removeChild(userTableBody.lastChild);
  }
  for (let i = 0; i < userData.userRecommendations.length; i++) {
    var tr = document.createElement('tr');
    var nameTd = document.createElement('td');
    nameTd.innerText = userData.userRecommendations[i].name;
    nameTd.addEventListener('click', () => {
      getPastRecommendation(userData.userRecommendations[i].youtubeID);
      window.scrollTo(0, 0);
    });
    var durationTd = document.createElement('td');
    durationTd.innerText = durationFormatting(
      userData.userRecommendations[i].duration
    );
    tr.appendChild(nameTd);
    tr.appendChild(durationTd);
    userTableBody.appendChild(tr);
  }
  sortTable(0, 'desc');
  userTableBody.scrollIntoView();
  if (document.getElementById('userLoading')) {
    document.getElementById('userLoading').remove();
  }
  let userTableSpan = document.getElementById('userTableSpan');
  userTableSpan.style.display = 'block';
  document.getElementById('userTable').style.display = 'inline';
}

async function getPastRecommendation(youtubeID) {
  let response = await fetch('/getRecommendationInformation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recommendationID: youtubeID }),
  });
  let recommendationData = await response.json();
  updateRecommendation(recommendationData);
  document.getElementById('recommendationFrame').style.display = 'block';
}
//************* */

function sortTable(n, dir = 'asc') {
  let table,
    rows,
    switching,
    i,
    x,
    y,
    a,
    b,
    shouldSwitch,
    switchCount = 0;
  table = document.getElementById('pastTable');
  switching = true;
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName('td')[n];
      y = rows[i + 1].getElementsByTagName('td')[n];
      a = isNaN(parseInt(x.innerHTML))
        ? x.innerHTML.toLowerCase()
        : parseInt(x.innerHTML);
      b = isNaN(parseInt(y.innerHTML))
        ? y.innerHTML.toLowerCase()
        : parseInt(y.innerHTML);
      if (dir == 'asc') {
        if (a > b) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == 'desc') {
        if (a < b) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchCount++;
    } else {
      if (switchCount == 0 && dir == 'asc') {
        dir = 'desc';
        switching = true;
      }
    }
  }
}

function durationFormatting(milliseconds) {
  let seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  let hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return hours + ':' + minutes + ':' + seconds;
}

function getYoutubeID(url) {
  url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return undefined !== url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}

let modal = document.getElementById('recommendationModal');
let modalInput = document.getElementById('modalInput');
let youtubeInput = document.getElementById('videoURL');
let modalPreview = document.getElementById('modalPreview');
let iFrame = document.getElementById('recommendationIframeSpan');
let modalResponse = document.getElementById('modalResponse');
let newRecommendationBtn = document.getElementById('addRecommendationBtn');

newRecommendationBtn.addEventListener('click', e => {
  modal.style.display = 'block';
});

let previewBtn = document.getElementById('previewBtn');
previewBtn.addEventListener('click', () => {
  if (
    document.getElementById('videoURL').value.length > 0 &&
    document.getElementById('descriptionTextArea').value.length > 0
  ) {
    updateModalPreview();
  } else {
    if (document.getElementById('videoURL').value.length > 0) {
      alert('Please fill the description of your recommendation!');
    } else {
      alert('Please enter the youtube URL of your recommendation!');
    }
  }
});

let submitBtn = document.getElementById('submitBtn');
submitBtn.addEventListener('click', sendRecommendationToDB);

async function updateModalPreview() {
  let previewNameSpan = document.getElementById('previewNameSpan');
  let previewCountrySpan = document.getElementById('previewCountrySpan');
  let previewDescriptionSpan = document.getElementById(
    'previewDescriptionSpan'
  );

  if (document.getElementById('nameSpan')) {
    previewNameSpan.innerText = document.getElementById('nameSpan').value;
    previewCountrySpan.innerText = document.getElementById('countrySpan').value;
  } else {
    previewNameSpan.innerText = 'Your Name';
    previewCountrySpan.innerText = 'Your Country';
  }

  previewDescriptionSpan.innerText = document.getElementById(
    'descriptionTextArea'
  ).value;
  let youtubeID = getYoutubeID(document.getElementById('videoURL').value);
  iFrame.src = 'https://www.youtube.com/embed/' + youtubeID + '?autoplay=1';

  modalInput.style.display = 'none';
  modalPreview.style.display = 'block';
}

async function sendRecommendationToDB() {
  let youtubeID = getYoutubeID(document.getElementById('videoURL').value);
  let name, language, email, country;
  if (document.getElementById('nameSpan')) {
    name = document.getElementById('nameSpan').value;
    language = document.getElementById('languageSpan').value;
    email = document.getElementById('emailSpan').value;
    country = document.getElementById('countrySpan').value;
  }
  let descriptionTextArea = document.getElementById('descriptionTextArea');
  modalPreview.style.display = 'none';
  modalResponse.style.display = 'block';
  let saveRecommendationQuery = await fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      newRecommendationID: youtubeID,
      description: descriptionTextArea.value,
      name: name,
      email: email,
      language: language,
      country: country,
      recommendationType: 'music',
    }),
  });
  let response = await saveRecommendationQuery.json();

  let responseFromServer = document.getElementById('responseFromServer');
  responseFromServer.innerText = response.answer;
}

function clearModal() {
  document.getElementById('videoURL').value = '';
  document.getElementById('descriptionTextArea').value = '';
  document.getElementById('recommendationIframeSpan').src = '';
  document.getElementById('responseFromServer').innerText =
    'The recommendation is being sent to the future...';
}

youtubeInput.addEventListener('blur', checkYoutubeInput);

async function checkYoutubeInput() {
  let youtubeID = getYoutubeID(youtubeInput.value);
  if (youtubeID.length !== 11 && youtubeID.length > 0) {
    alert('That URL is not valid, please try a new one.');
    youtubeInput.value = '';
  } else {
    await checkIfRecommendationIsInDatabase(youtubeID);
  }
}

let closeModalBtn = document.getElementById('closeModalBtn');
closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  modalInput.style.display = 'block';
  modalPreview.style.display = 'none';
  modalResponse.style.display = 'none';
});

let cancelBtn = document.getElementById('cancelBtn');
cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  clearModal();
});

let editBtn = document.getElementById('editBtn');
editBtn.addEventListener('click', () => {
  modalInput.style.display = 'block';
  modalPreview.style.display = 'none';
  iFrame.src = '';
});

let closeModalBtn2 = document.getElementById('closeButtonInResponseModal');
closeModalBtn2.addEventListener('click', () => {
  modalInput.style.display = 'block';
  modalResponse.style.display = 'none';
  modal.style.display = 'none';
  clearModal();
});

var newCommentForm = document.getElementById('newCommentForm');
newCommentForm.onsubmit = async e => {
  e.preventDefault();
  let newComment = {};
  newComment.commenterName = document.getElementById('commenterName').value;
  newComment.comment = document.getElementById('newComment').value;
  var recommendationID = player.getVideoData()['video_id'];
  fetch('/addNewCommentToRecommendation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recommendationID: recommendationID,
      commenter: newComment.commenterName,
      comment: newComment.comment,
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.getElementById('commenterName').value = '';
        document.getElementById('newComment').value = '';
        addNewCommentToDisplay(newComment);
      } else {
        alert(
          'Oops, there was a problem saving your comment. Please try again.'
        );
      }
    });
};

function addNewCommentToDisplay(comment) {
  let newDiv = document.createElement('div');
  newDiv.classList.add('commentDiv');
  let newCommentP = document.createElement('p');
  newCommentP.classList.add('recommendationComment');
  newCommentP.innerText = comment.comment;
  let newAuthorP = document.createElement('p');
  newAuthorP.innerHTML =
    '<p><strong>Author: </strong> ' + comment.commenterName + '</p>';
  let newDateP = document.createElement('p');
  newDateP.innerHTML = '<p><strong>Date: </strong> ' + new Date() + '</p>';
  newDiv.appendChild(newCommentP);
  newDiv.appendChild(newAuthorP);
  newDiv.appendChild(newDateP);
  document.getElementById('commentsDisplay').appendChild(newDiv);
}

function clearRecommendationComments() {
  document.getElementById('commentsDisplay').innerHTML = '';
}
