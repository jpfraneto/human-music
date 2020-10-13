var mongoose = require("mongoose");

var recommendationSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        country: String
    },
    name: String,
    type: String,
    recommendationDate: {
        type: String,
        default: Date.now.toString(),
    },
    url: String,
    description:String,
    status: String,
    duration: Number,
    wasCreatedByUser: Boolean,
    startingRecommendationTimestamp: Number,
    image: String,
    daySKU: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Recommendation", recommendationSchema);