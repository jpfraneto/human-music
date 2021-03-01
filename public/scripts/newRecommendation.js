let modal = document.getElementById("recommendationModal");
  
let modalInput = document.getElementById("modalInput");
let youtubeInput = document.getElementById("videoURL");
youtubeInput.removeEventListener('blur', checkYoutubeInput);

let modalPreview = document.getElementById("modalPreview");
let iFrame = document.getElementById("recommendationIframeSpan");

let modalResponse = document.getElementById("modalResponse");

modal.style.display = "block";

youtubeInput.addEventListener('blur', checkYoutubeInput);

async function checkYoutubeInput () {
  let youtubeID = (getYoutubeID(youtubeInput.value));
  if(youtubeID.length !== 11 && youtubeID.length>0){
    alert("That URL is not valid, please try a new one.");
    youtubeInput.value = "";
  } else {
    await checkIfRecommendationIsInDatabase(youtubeID);
  }
}

let closeModalBtn = document.getElementById("closeModalBtn");
closeModalBtn.addEventListener("click", ()=>{
  modal.style.display = "none"
  modalInput.style.display = "block";
  modalPreview.style.display = "none";
  modalResponse.style.display = "none";
  iFrame.src = "";
})

let previewBtn = document.getElementById("previewBtn");
previewBtn.addEventListener("click", ()=>{
  if(document.getElementById("videoURL").value.length>0 && document.getElementById("descriptionTextArea").value.length >0){
    updateModalPreview()
  }
});

let cancelBtn = document.getElementById("cancelBtn");
cancelBtn.addEventListener("click", ()=>{
  modal.style.display = "none";
  clearModal();
})

let editBtn = document.getElementById("editBtn");
editBtn.addEventListener("click", ()=>{
  modalInput.style.display = "block";
  modalPreview.style.display = "none";
  iFrame.src = "";
});

let closeModalBtn2 = document.getElementById("closeButtonInResponseModal");
closeModalBtn2.addEventListener("click", ()=>{
  modalInput.style.display = "block";
  modalResponse.style.display = "none";
  document.getElementById("responseFromServer").innerText = "The recommendation is being sent to the future...";
  modal.style.display = "none";
  iFrame.src = "";
})

let submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", sendRecommendationToDB);

function clearModal () {
  if(document.getElementById("usernameInput") && document.getElementById("country")){
    document.getElementById("usernameInput").value = "";
    document.getElementById("country").value = "";
  }
  document.getElementById("videoURL").value = "";
  document.getElementById("descriptionTextArea").value = "";
  document.getElementById("recommendationIframeSpan").src = "";
  document.getElementById("userCheckbox").checked = false;
}

async function updateModalPreview (){
  let usernameSpan = document.getElementById("usernameSpan");
  let countrySpan = document.getElementById("countrySpan");
  let descriptionSpan = document.getElementById("descriptionSpan");
  let userData;
  if (document.getElementById("username") && document.getElementById("country")){
    usernameSpan.innerText = document.getElementById("usernameInput").value;
    countrySpan.innerText = document.getElementById("country").value;
  } else {
    const response = await fetch("/getUserInfo");
    userData = await response.json();
    usernameSpan.innerText = userData.username;
    countrySpan.innerText = userData.country;
  }
  descriptionSpan.innerText = document.getElementById("descriptionTextArea").value;
  let youtubeID = getYoutubeID(document.getElementById("videoURL").value)
  iFrame.src = "https://www.youtube.com/embed/" + youtubeID + "?autoplay=1";

  modalInput.style.display = "none";
  modalPreview.style.display = "block";
}

async function sendRecommendationToDB () {
  let wasCreatedByUser = document.getElementById("userCheckbox").checked;
  let youtubeID = getYoutubeID(document.getElementById("videoURL").value);
  let usernameSpan = document.getElementById("usernameSpan");
  let countrySpan = document.getElementById("countrySpan");
  let descriptionSpan = document.getElementById("descriptionSpan");
  modalPreview.style.display = "none";
  modalResponse.style.display = "block";
  let saveRecommendationQuery = await fetch("/", {
    method : "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body : JSON.stringify({
      newRecommendationID:youtubeID, 
      description:descriptionSpan.innerText, 
      username:usernameSpan.innerText, 
      country:countrySpan.innerText, 
      wasCreatedByUser:wasCreatedByUser,
      recommendationType:"music",
    })
  });
  let response = await saveRecommendationQuery.json();
  
  let responseFromServer = document.getElementById("responseFromServer");
  responseFromServer.innerText = response.answer;
  clearModal();
}