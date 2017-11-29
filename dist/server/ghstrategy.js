"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var passport_github_1 = require("passport-github");
var secrets_1 = require("./secrets");
var User_1 = require("./User");
var callbackURL = process.env.NODE_ENV === 'production'
    ? 'http://tcq.azurewebsites.net/auth/github/callback'
    : 'http://127.0.0.1:3000/auth/github/callback';
exports.default = new passport_github_1.Strategy({
    clientID: secrets_1.GITHUB_CLIENT_ID,
    clientSecret: secrets_1.GITHUB_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['user:email']
}, function (accessToken, refreshToken, profile, cb) {
    var user = {
        name: profile.displayName,
        ghUsername: profile.username,
        organization: profile._json.company,
        accessToken: accessToken,
        refreshToken: refreshToken,
        ghid: Number(profile.id) // I think this is already a number for the github API
    };
    User_1.addKnownUser(User_1.fromGHAU(user));
    cb(null, user);
});
