window.onload = () => {
    remainingVoidTime = updateClock();
    timer = setInterval(updateClock, 1000);
    setTimeout (() => {
    clearInterval(timer);
    window.location.reload()
    }, 600000);
  }
  
  function updateClock () {
    let  presentTimeSpan = document.getElementById("presentTime");
    presentTimeSpan.innerHTML = (new Date()).toUTCString().substring(17,25);
  
    return remainingVoidTime;
  }
  