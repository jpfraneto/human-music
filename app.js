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
    Cycle           = require("./models/cycle"),
    chiita        = require("./middleware/chiita"),
    theSource     = require("./middleware/theSource"),
    seedDB        = require("./seeds2");

let systemStatus;

const recommendationRoutes = require("./routes/recommendations"),
      indexRoutes          = require("./routes/index"),
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

console.log("The app.js file is running again.");
setTimeout(theSource.checkSystem);

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