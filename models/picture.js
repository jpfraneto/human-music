var mongoose = require("mongoose");

var pictureSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        country: String
    },
    date: String,
    url: String,
    description:String,
    status: String,
    duration: Number,
    wasCreatedByUser: Boolean,
    startingTimestamp: Number,
    dayID: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Picture", pictureSchema);