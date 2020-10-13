var mongoose = require("mongoose");

var missionSchema = new mongoose.Schema({
    username: String,
    date : String,
    isReady : Boolean,
    name : String,
    description : String
});

module.exports = mongoose.model("Mission", missionSchema);