const mongoose = require('mongoose');

var Schema = mongoose.Schema;
const userSchema = Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    schoolName: {
        type: String,
        required: true
    },
    teamName: {
        type: String,
        required: false
    },
    existingTeamName: {
        type: String,
        required: false
    },
    userPosition: {
        type: String,
        required: false
    },
    gameMode: {
        type: String,
        required: true
    },
    canAnswer: {
        type: Boolean,
        required: true
    },
    messageT: {
        type: String,
        required: false
    },
    messageR: {
        type: String,
        required: false
    },
    canAddUpto: {
        type: Number,
        required: false
    }

});
const userDetails = mongoose.model("userDetails", userSchema);

exports.userDetails = userDetails;




