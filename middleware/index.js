var Recommendation = require("../models/recommendation");
var middlewareObj = {};

middlewareObj.checkRecommendationOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Recommendation.findById(req.params.id, function(err, foundRecommendation){
            if(err || !foundRecommendation){
                req.flash("error", "Recommendation not found");               
                res.redirect("back");
            } else {
                if(foundRecommendation.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

middlewareObj.isNotLoggedIn = function(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You cannot be here if you are already logged in!");
    res.redirect("/");
};

middlewareObj.isChocapec = function(req, res, next){
    if(req.user){
        if(req.user.username !== "chocapec"){
            res.redirect("/");
        } else {
            return next();
        }
    } else {
        res.redirect("/");
    }
}

module.exports = middlewareObj;