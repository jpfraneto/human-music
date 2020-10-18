var express = require("express");
var router = express.Router({mergeParams: true});
var Feedback = require("../models/feedback");
var Comment = require("../models/comment");
var middleware = require("../middleware");
let chiita = require("../middleware/chiita");

// Comments - New
let today = new Date();

router.get("/comments/new", function(req,res){
    if(req.user){
        Feedback.findById(req.params.id, function(err, feedback){
            if(err){
                console.log(err);
            } else {
                res.render("comments/new", {feedback: feedback, user:req.user});
            }
        });
    } else {
        Feedback.findById(req.params.id, function(err, feedback){
            if(err){
                console.log(err);
            } else {
                res.render("comments/new", {feedback: feedback, user:undefined});
            }
        });
    }
});


// Comments - Create
router.post("/", function(req, res){
    Feedback.findById(req.params.id)
    .then((feedback)=>{
        let id, username, country;
        if(req.user){
            id = req.user._id,
            username = req.user.username,
            country = req.user.country
        } else {
            id = undefined,
            username = req.body.usernameInput,
            country = req.body.userCountry
        }
        let newComment = new Comment({
            text : req.body.comment,
            author : {
                id: id,
                username : username,
                country : country
            },
            commentDate : chiita.changeDateFormat(today)
        });
        newComment.save(()=>{
            console.log("The comment was saved in the DB");
            feedback.comments.push(newComment);
            feedback.save(()=>{
                console.log("The feedback was saved");
                res.redirect("/future/feedback/" + feedback._id);
            })
        })
    })
    .catch(()=>{
        console.log("There was an error");
        res.redirect("/future/feedback");
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Feedback.findById(req.params.id, function(err, foundFeedback) {
        if (err || !foundFeedback) {
            req.flash("error", "No feedback found");
            return res.redirect("back");
        } 
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {feedback_id: req.params.id, comment:foundComment});
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
        res.redirect("/future/feedback/" + req.params.id );
    }
    });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
        res.redirect("back");
    } else {
        res.redirect("/future/feedack/" + req.params.id);
    }
    });
});


module.exports = router;