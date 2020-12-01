var mongoose = require("mongoose");

var cycleSchema = new mongoose.Schema({
    cycleIndex: Number,  //determined by the previous cycle index
    cycleDuration : Number,
    startingDate : {
        type: Date,
        default: Date.now,
    },
    daysOfThisCycle: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Day"
        }
    ]
});

module.exports = mongoose.model("Cycle", cycleSchema);