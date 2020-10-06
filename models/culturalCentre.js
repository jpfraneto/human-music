var mongoose = require("mongoose");

var culturalCentreSchema = new mongoose.Schema({
    country: String,
    location: String,
    owner: {
        type: String,
        default: Date.now.toString(),
    },
});

module.exports = mongoose.model("CulturalCentre", culturalCentreSchema);