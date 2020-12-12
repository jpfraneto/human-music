let x = setInterval(function(){
    let now = new Date().getTime();
    let eclipse = 1607962479000;

    let timeGap = (eclipse-now);
    var days = Math.floor(timeGap / (1000 * 60 * 60 * 24));
    var hours = Math.floor((timeGap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((timeGap % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeGap % (1000 * 60)) / 1000);

    document.getElementById("countdownClock").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
}, 1000)

