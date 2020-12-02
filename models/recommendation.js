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
    youtubeID : String,
    description:String,
    status: String,
    duration: Number,
    wasCreatedByUser: Boolean,
    startingRecommendationTimestamp: Number,
    daySKU: String,
    favorited : Number
});

module.exports = mongoose.model("Recommendation", recommendationSchema);