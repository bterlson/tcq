"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GHA = require("github");
var v;
function default_1(token) {
    var gha = new GHA();
    gha.authenticate({
        type: 'oauth',
        token: token
    });
    return gha;
}
exports.default = default_1;
