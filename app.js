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
    Comment       = require("./models/comment"),
    Day           = require("./models/day"),
    Cycle           = require("./models/cycle"),
    chiita        = require("./middleware/chiita"),
    seedDB        = require("./seeds2");

let systemStatus;

const recommendationRoutes = require("./routes/recommendations"),
      indexRoutes          = require("./routes/index"),
      commentRoutes        = require("./routes/comments"),
      userRoutes           = require("./routes/users");

mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.DATABASE_MONGODB, { useNewUrlParser: true, useFindAndModify: false });

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
if(process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https')
        res.redirect(`https://${req.header('host')}${req.url}`)
      else
        next()
    })
}

/////////////////////SET FUNCTIONS////////////////////////////

//For starting from scratch
// chiita.bigBang();
//For sending all the recommendations to the future
// chiita.bigBangTwo();

// If the app crashes, or the dynos are being cycled, this function will update the system and have it working nice.
// // console.log("The app.js file is running again.");
chiita.timeWarp();

// chiita.createNewDay();

let job = new CronJob("14 16 * * *", () => {
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
app.use("/future/feedback/:id", commentRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("The Human Music Server Has Started!");
});