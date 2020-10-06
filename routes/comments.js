var express = require("express");
var router = express.Router({mergeParams: true});
var recommendation = require("../models/recommendation");
var Comment = require("../models/comment");
var middleware = require("../middleware")

// Comments - New

router.get("/new", middleware.isLoggedIn, function(req,res){
    // find recommendation by id
    recommendation.findById(req.params.id, function(err, recommendation){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {recommendation: recommendation});
        }
    });
});


// Comments - Create
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup recommendation using ID
    recommendation.findById(req.params.id, function(err, recommendation){
        if(err){
            console.log(err);
            res.redirect("/recommendations");
        } else {
            Comment.create(req.body.comment, function(err,comment){
                if(err){
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user.id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    recommendation.comments.push(comment);
                    recommendation.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/recommendations/"+ recommendation._id);
                }
            });
        }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    recommendation.findById(req.params.id, function(err, foundrecommendation) {
        if (err || !foundrecommendation) {
            req.flash("error", "No recommendation found");
            return res.redirect("back");
        } 
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {recommendation_id: req.params.id, comment:foundComment});
            }
        });
    });
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    if (err){
        res.redirect("back");
    } else {
        res.redirect("/recommendations/" + req.params.id );
    }
    });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
        res.redirect("back");
    } else {
        res.redirect("/recommendations/" + req.params.id);
    }
    });
});

module.exports = router;