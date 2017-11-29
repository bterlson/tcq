"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var prod = process.env.NODE_ENV === 'production';
exports.GITHUB_CLIENT_SECRET = prod
    ? process.env['TCQ_GH_SECRET']
    : process.env['TCQ_LOCAL_GH_SECRET'];
exports.GITHUB_CLIENT_ID = prod ? process.env['TCQ_GH_ID'] : process.env['TCQ_LOCAL_GH_ID'];
exports.SESSION_SECRET = process.env['TCQ_SESSION_SECRET'];
exports.CDB_SECRET = process.env['TCQ_CDB_SECRET'];
exports.AI_IKEY = process.env['TCQ_AI_IKEY'];
if (!exports.GITHUB_CLIENT_SECRET) {
    logger_1.default.fatal('ERROR\tNo client secret. Set TCQ_GH_SECRET.');
    process.exit(1);
}
if (!exports.GITHUB_CLIENT_ID) {
    logger_1.default.fatal('ERROR\tNo client id. Set TCQ_GH_ID.');
    process.exit(1);
}
if (!exports.SESSION_SECRET) {
    logger_1.default.fatal('ERROR\tNo session secret. Set TCQ_SESSION_SECRET.');
    process.exit(1);
}
if (!exports.CDB_SECRET) {
    logger_1.default.fatal('ERROR\tNo CosmosDB secret. Set TCQ_CDB_SECRET.');
    process.exit(1);
}
if (!exports.AI_IKEY) {
    logger_1.default.fatal('ERROR\tNo Application Insights Instrumentation Key. Set TCQ_AI_IKEY.');
    process.exit(1);
}
