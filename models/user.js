var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    country: String,
    language: String,
    email: String,
    bio: String,
    recommendations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recommendation"
        }
    ],
    favoriteRecommendations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recommendation"
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);