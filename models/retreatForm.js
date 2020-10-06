var mongoose = require("mongoose");

var retreatSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        country: String
    },
    message: String,
    messageDate: {
        type: String,
        default: Date.now.toString(),
    },
});

module.exports = mongoose.model("Retreat", retreatSchema);