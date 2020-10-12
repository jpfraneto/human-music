var mongoose = require("mongoose");

var dojoSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        country: String
    },
    isPrivate: Boolean,
    introduction: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Challenge"
        }
    ],
    ideas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Idea"
        }
    ],
    dailies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dailie"
        }
    ],
    advice: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Advice"
        }
    ]
});

module.exports = mongoose.model("Dojo", dojoSchema);