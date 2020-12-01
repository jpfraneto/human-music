setInterval(updateCountdown,1000);

function updateCountdown () {
    let now = new Date().getTime();
    let eclipse = 1607962479000;

    let timeGap = Math.abs(eclipse-now);

    hours = parseInt((timeGap/(3600)));
    minutes = parseInt((timeGap/(60000))%60);
    seconds = parseInt((timeGap/1000)%60);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    document.getElementById("countdownHours").innerText = hours;
    document.getElementById("countdownMinutes").innerText = minutes;
    document.getElementById("countdownSeconds").innerText = seconds;
}

