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
    User          = require("./models/user"),
    Day           = require("./models/day"),
    chiita        = require("./middleware/chiita"),
    seedDB        = require("./seeds");

const recommendationRoutes = require("./routes/recommendations"),
      indexRoutes          = require("./routes/index"),
      userRoutes           = require("./routes/users");

mongoose.set('useUnifiedTopology', true);
// mongoose.connect("mongodb://localhost/humanMusic", { useNewUrlParser: true, useFindAndModify: false });
mongoose.connect(process.env.DATABASE_MONGODB, { useNewUrlParser: true, useFindAndModify: false });


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//Global Variables
let dimension88cCurrentTimestamp;

/////////////////////SET FUNCTIONS////////////////////////////

//For starting from scratch
// chiita.bigBang();
//For sending the recommendations to the future
// chiita.bigBangTwo();

// chiita.bigBang();
// setTimeout(chiita.createNewDay, 2000);

//If the app crashes, or the dynos are being cycled, this function will update the system and have it working nice.
chiita.timeWarp();
// chiita.createNewDay();

setInterval(()=>{
    console.log("This message is logged every 15 minutes")
}, 900000);

let job = new CronJob("43 20 * * *", () => {
    chiita.createNewDay();
}, undefined, true, "UTC");

//The following is the code that starts a new cycle when this one is over

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
app.use("/users", userRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("The Human Music Server Has Started!");
});