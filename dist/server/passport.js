"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var passport = require("passport");
var ghstrategy_1 = require("./ghstrategy");
passport.use(ghstrategy_1.default);
passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});
exports.default = passport;
