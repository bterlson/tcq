"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var secrets = require("./secrets");
// important that this block come very early as appinsights shims many things
var telemetry_1 = require("./telemetry");
var logger_1 = require("./logger");
var express = require("express");
var passport_1 = require("./passport");
var router_1 = require("./router");
var socketio = require("socket.io");
var http_1 = require("http");
var Session = require("express-session");
var socket_hander_1 = require("./socket-hander");
var DocumentDBSession = require("documentdb-session");
var dbConstants = require("./db");
var bodyParser = require("body-parser");
var app = express();
var server = new http_1.Server(app);
var io = socketio(server, { perMessageDeflate: false });
var port = process.env.PORT || 3000;
logger_1.default.info('Starting server');
server.listen(port, function () {
    logger_1.default.info('Application started and listening on port ' + port);
});
var DocumentDBStore = DocumentDBSession(Session);
var sessionStore = new DocumentDBStore({
    host: dbConstants.HOST,
    database: dbConstants.DATABASE_ID,
    collection: dbConstants.SESSION_COLLECTION_ID,
    key: secrets.CDB_SECRET
});
var session = Session({
    secret: secrets.SESSION_SECRET,
    store: sessionStore,
    resave: true,
    saveUninitialized: true
});
app.use(function (req, res, next) {
    telemetry_1.default.trackNodeHttpRequest({ request: req, response: res });
    next();
});
app.use(require('express-bunyan-logger')());
app.use(bodyParser.json());
app.use(session);
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(router_1.default);
app.use(express.static('dist/client/'));
io.use(function (socket, next) {
    var req = socket.handshake;
    var res = {};
    session(req, res, next);
});
io.on('connection', socket_hander_1.default);
exports.default = app;
