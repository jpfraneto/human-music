var mongoose = require("mongoose");

var voidImageSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        country: String
    },
    name: String,
    imageDate: {
        type: String,
        default: Date.now.toString(),
    },
    description:String,
    wasCreatedByUser: Boolean,
    imageURL: String,
});

module.exports = mongoose.model("voidImage", voidImageSchema);