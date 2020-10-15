var mongoose = require("mongoose");

var ideaSchema = new mongoose.Schema({
    username: String,
    date : String,
    name : String,
    description : String
});

module.exports = mongoose.model("Idea", ideaSchema);