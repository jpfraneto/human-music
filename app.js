require('dotenv').config()

let CronJob = require("cron").CronJob;
let express       = require("express"),
    app           = express(),
    bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    flash         = require("connect-flash"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Recommendation = require("./models/recommendation"),
    Comment       = require("./models/comment"),
    User          = require("./models/user"),
    Day           = require("./models/day"),
    theSource     = require("./middleware/theSource"),
    chiita        = require("./middleware/chiita"),
    seedDB        = require("./seeds");

const commentRoutes        = require("./routes/comments"),
    recommendationRoutes = require("./routes/recommendations"),
    indexRoutes          = require("./routes/index"),
    userRoutes           = require("./routes/users"),
    challengesRoutes     = require("./routes/challenges");

// const { createNewDay } = require("./middleware/theSource");

mongoose.set('useUnifiedTopology', true);
// mongoose.connect("mongodb://localhost/humanMusic", { useNewUrlParser: true, useFindAndModify: false });
mongoose.connect(process.env.DATABASE_MONGODB, { useNewUrlParser: true, useFindAndModify: false });


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

/////////////////////SET FUNCTIONS////////////////////////////
chiita.bigBang();
setInterval(()=>{
    console.log("This message is logged every 15 minutes")
}, 900000);

//The following is the code that starts a new day every day at 8:08 PM
let job = new CronJob("44 20 * * *", () => {
    console.log("I'm inside the cronjob that is scheduled for every day at 20:08. It is supposed to send the present day to the past and create a new day which's status is present");
    chiita.createNewDay();
}, undefined, true, "UTC");

app.use(require("express-session")({
    secret: "Music to nourish your soul and activate your mind",
    resave : false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/recommendations/:id/comments", commentRoutes);
app.use("/users", userRoutes);
app.use("/challenges", challengesRoutes);



// The following will be the code that runs at the moment of the eclipse. Everything will start from scratch.
// let eclipseTimestamp = 1607962479000;
// let eclipseDateObject = new Date(eclipseTimestamp);
// let eclipse = new CronJob(eclipseDateObject, () => {
//     chiita.bigBang();
// }, undefined, true);

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("The Human Music Server Has Started!");
});