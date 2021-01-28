var Recommendation = require("../models/recommendation");
var middlewareObj = {};

middlewareObj.checkRecommendationOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Recommendation.findById(req.params.id, function(err, foundRecommendation){
            if(err || !foundRecommendation){
                req.flash("error", "Recommendation not found");               
                res.redirect("back");
            } else {
                if(foundRecommendation.author.username === req.user.username){
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

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                //does the user own the comment?
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

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

middlewareObj.isUser = function(req, res, next){
    if(req.user){
        if(req.user.username === req.params.username){
            return next();
        } else {
            res.redirect("/")
        }
    } else {
        res.redirect("/");
    }
}

module.exports = middlewareObj;