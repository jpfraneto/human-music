var mongoose = require("mongoose");

var challengeSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        country: String
    },
    name: String,
    description: String,
    challengeDate: {
        type: String,
        default: Date.now.toString(),
    },
    challengeDuration: Number,
});

module.exports = mongoose.model("Challenge", challengeSchema);