var mongoose = require("mongoose");

var daySchema = new mongoose.Schema({
    dayIndex: Number,  //determined by the previous day index
    startingDayTimestamp: Number, //determined by the previous day starting timestamp
    status: String, 
    systemStatus : String,
    daySKU: String, //determined by the previous day sku
    totalRecommendationsOfThisDay: Number,
    elapsedRecommendations: Number,
    chiDurationForThisDay: Number,
    recommendationDurationsOfThisDay: [
        {
            type:Number
        }
    ],
    startingTimestampsOfThisDay: [
        {
            type:Number
        }
    ],
    filmOfThisDay: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recommendation"
        }
    ],
    recommendationsOfThisDay: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recommendation"
        }
    ]
});

module.exports = mongoose.model("Day", daySchema);