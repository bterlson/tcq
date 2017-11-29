"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chairs = new Set([
    11236 /* brian */,
    972891 /* daniel */,
    189835 /* littledan */,
    301201 /* leo balter */,
    6708936 /* rex */
]);
function isChair(userid) {
    return chairs.has(userid);
}
exports.isChair = isChair;
