var mongoose = require("mongoose");

var dailieSchema = new mongoose.Schema({
    index : Number,
    username: String,
    date : String,
    name : String,
    description : String
});

module.exports = mongoose.model("Dailie", dailieSchema);