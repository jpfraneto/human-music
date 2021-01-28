let modal = document.getElementById("recommendationModal");
let editBtn = document.getElementById("editBtn");
let submitToFutureBtn = document.getElementById("submitToFutureBtn");
let previewBtn = document.getElementById("previewBtn");
let addRecommendationForm = document.getElementById("addRecommendationForm");
let closeModalBtn = document.getElementById("closeModalBtn");

submitToFutureBtn.addEventListener("click", ()=>{
  alert("Your recommendation is now in the future! Thank you for helping build this space")
  addRecommendationForm.submit();
});
editBtn.addEventListener("click", ()=>{
  modal.style.display = "none"
});
closeModalBtn.addEventListener("click", ()=>{
  modal.style.display = "none"
})
window.onclick = (e) => {
  if(e.target == modal) {
    modal.style.display = "none"
  }
}

previewBtn.addEventListener("click", async () => {
  let iFrame = document.getElementById("recommendationIframeSpan");
  let usernameSpan = document.getElementById("usernameSpan");
  let countrySpan = document.getElementById("countrySpan");
  let descriptionSpan = document.getElementById("descriptionSpan");
  if (document.getElementById("username") && document.getElementById("country")){
    usernameSpan.innerText = document.getElementById("username").value;
    countrySpan.innerText = document.getElementById("country").value;
  } else {
    const response = await fetch("/getUserInfo");
    const userData = await response.json();
    console.log(userData);
    usernameSpan.innerText = userData.username;
    countrySpan.innerText = userData.country;
  }
  descriptionSpan.innerText = document.getElementById("descriptionTextArea").value;
  let youtubeID = getYoutubeID(document.getElementById("videoURL").value)
  iFrame.src = "https://www.youtube.com/embed/" + youtubeID + "?autoplay=1";

  if(descriptionSpan.innerText.length>0 && countrySpan.innerText && usernameSpan.innerText && youtubeID){
    modal.style.display = "block";
  } else {
    alert("Please fill in all the elements :)")
  }
})

addRecommendationForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  alert("Your recommendation is now in the future! Thank you for helping build this space")
  addRecommendationForm.submit();
})

let youtubeInput = document.getElementById("videoURL");
youtubeInput.addEventListener('blur', () => {
  let youtubeID = (getYoutubeID(youtubeInput.value));
  if(youtubeID.length !== 11){
    alert("That URL is not valid, please try a new one.");
  } else {
    console.log("The link works, and the youtube ID is: " + youtubeID); 
  }
});

function getYoutubeID(url){
  url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return undefined !== url[2]?url[2].split(/[^0-9a-z_\-]/i)[0]:url[0];
}