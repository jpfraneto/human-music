var mongoose = require("mongoose");

var cycleSchema = new mongoose.Schema({
    cycleDuration: Number,
    cycleName: String,
    cycleIndex: Number,
    cycleStartingTimestamp: Number,
    elapsedDaysOfThisCycle: Number,
    status: String,
    daysOfThisCycle: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Day"
        },
    ],
});

module.exports = mongoose.model("Cycle", cycleSchema);