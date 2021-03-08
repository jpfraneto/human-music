var mongoose = require("mongoose");

var podcastEmailSchema = new mongoose.Schema({
    email: String,
});

module.exports = mongoose.model("PodcastEmail", podcastEmailSchema);