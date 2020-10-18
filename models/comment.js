var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text:String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        country: String
    },
    commentDate: {
        type: String,
        default: Date.now.toString(),
    }
});

module.exports = mongoose.model("Comment", commentSchema);