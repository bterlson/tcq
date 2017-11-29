"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var User_1 = require("./User");
var User_2 = require("./User");
var Message = require("../shared/Messages");
var db_1 = require("./db");
var ghapi_1 = require("./ghapi");
var PRIORITIES = ['poo', 'question', 'reply', 'topic'];
var uuid = require("uuid");
var telemetry_1 = require("./telemetry");
var pLimit = require("p-limit");
var socks = new Set();
// not ideal, but necessary to prevent interleaving updates
var waitTurn = pLimit(1);
function connection(socket) {
    return __awaiter(this, void 0, void 0, function () {
        function meetingToState(meeting) {
            // way too many type annotations
            var state = Object.keys(meeting)
                .filter(function (k) { return k[0] !== '_'; })
                .reduce(function (s, k) {
                s[k] = meeting[k];
                return s;
            }, {});
            state.user = user;
            return state;
        }
        function nextAgendaItem(respond, message) {
            return __awaiter(this, void 0, void 0, function () {
                var meeting, id_1, currentIndex;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db_1.getMeeting(meetingId)];
                        case 1:
                            meeting = _a.sent();
                            if (meeting.currentAgendaItem && meeting.currentAgendaItem.id !== message.currentItemId) {
                                respond(403, { message: 'Agenda item out of sync' });
                                return [2 /*return*/];
                            }
                            if (!meeting.currentAgendaItem) {
                                // waiting for meeting to start, so kick it off.
                                meeting.currentAgendaItem = meeting.agenda[0];
                            }
                            else {
                                id_1 = meeting.currentAgendaItem.id;
                                currentIndex = meeting.agenda.findIndex(function (i) { return i.id === id_1; });
                                meeting.currentAgendaItem = meeting.agenda[currentIndex + 1];
                            }
                            meeting.currentSpeaker = {
                                id: uuid(),
                                user: meeting.currentAgendaItem.user,
                                topic: 'Introducing: ' + meeting.currentAgendaItem.name,
                                type: 'topic'
                            };
                            return [4 /*yield*/, db_1.updateMeeting(meeting)];
                        case 2:
                            _a.sent();
                            respond(200);
                            emitAll(Message.Type.nextAgendaItem, meeting.currentAgendaItem);
                            emitAll(Message.Type.newCurrentSpeaker, meeting.currentSpeaker);
                            return [2 /*return*/];
                    }
                });
            });
        }
        function deleteAgendaItem(respond, message) {
            return __awaiter(this, void 0, void 0, function () {
                var meeting;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db_1.getMeeting(meetingId)];
                        case 1:
                            meeting = _a.sent();
                            if (!User_2.isChair(user, meeting)) {
                                respond(403);
                                return [2 /*return*/];
                            }
                            meeting.agenda.splice(message.index, 1);
                            return [4 /*yield*/, db_1.updateMeeting(meeting)];
                        case 2:
                            _a.sent();
                            respond(200);
                            emitAll(Message.Type.deleteAgendaItem, message);
                            return [2 /*return*/];
                    }
                });
            });
        }
        function reorderAgendaItem(respond, message) {
            return __awaiter(this, void 0, void 0, function () {
                var meeting;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db_1.getMeeting(meetingId)];
                        case 1:
                            meeting = _a.sent();
                            if (!User_2.isChair(user, meeting)) {
                                respond(403);
                                return [2 /*return*/];
                            }
                            meeting.agenda.splice(message.newIndex, 0, meeting.agenda.splice(message.oldIndex, 1)[0]);
                            return [4 /*yield*/, db_1.updateMeeting(meeting)];
                        case 2:
                            _a.sent();
                            respond(200);
                            emitAll(Message.Type.reorderAgendaItem, message);
                            return [2 /*return*/];
                    }
                });
            });
        }
        function newAgendaItem(respond, message) {
            return __awaiter(this, void 0, void 0, function () {
                var meeting, owner, e_1, agendaItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db_1.getMeeting(meetingId)];
                        case 1:
                            meeting = _a.sent();
                            if (!User_2.isChair(user, meeting)) {
                                respond(403);
                                return [2 /*return*/];
                            }
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, User_1.getByUsername(message.ghUsername, githubUser.accessToken)];
                        case 3:
                            owner = _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            e_1 = _a.sent();
                            respond(400, { message: 'Github username not found' });
                            return [2 /*return*/];
                        case 5:
                            agendaItem = {
                                id: uuid(),
                                name: message.name,
                                timebox: Number(message.timebox),
                                user: owner
                            };
                            meeting.agenda.push(agendaItem);
                            return [4 /*yield*/, db_1.updateMeeting(meeting)];
                        case 6:
                            _a.sent();
                            telemetry_1.default.trackEvent({ name: 'New Agenda Item' });
                            emitAll(Message.Type.newAgendaItem, agendaItem);
                            respond(200);
                            return [2 /*return*/];
                    }
                });
            });
        }
        function newTopic(respond, message) {
            return __awaiter(this, void 0, void 0, function () {
                var speaker, meeting, currentSpeaker, queuedSpeakers, index;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            speaker = __assign({ user: user }, message);
                            return [4 /*yield*/, db_1.getMeeting(meetingId)];
                        case 1:
                            meeting = _a.sent();
                            currentSpeaker = meeting.currentSpeaker, queuedSpeakers = meeting.queuedSpeakers;
                            index = queuedSpeakers.findIndex(function (queuedSpeaker) {
                                return PRIORITIES.indexOf(queuedSpeaker.type) > PRIORITIES.indexOf(speaker.type);
                            });
                            if (index === -1) {
                                index = queuedSpeakers.length;
                            }
                            queuedSpeakers.splice(index, 0, speaker);
                            return [4 /*yield*/, db_1.updateMeeting(meeting)];
                        case 2:
                            _a.sent();
                            emitAll(Message.Type.state, meetingToState(meeting));
                            telemetry_1.default.trackEvent({ name: 'New Speaker' });
                            respond(200);
                            return [2 /*return*/];
                    }
                });
            });
        }
        function nextSpeaker(respond) {
            return __awaiter(this, void 0, void 0, function () {
                var meeting, oldTopic;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db_1.getMeeting(meetingId)];
                        case 1:
                            meeting = _a.sent();
                            if (user.ghid &&
                                meeting.currentSpeaker &&
                                meeting.currentSpeaker.user.ghid !== user.ghid &&
                                !User_2.isChair(user, meeting)) {
                                // unauthorized
                                respond(402, { message: 'not authorized' });
                                return [2 /*return*/];
                            }
                            oldTopic = meeting.currentTopic;
                            if (meeting.queuedSpeakers.length === 0) {
                                if (meeting.currentAgendaItem) {
                                    meeting.currentSpeaker = {
                                        id: uuid(),
                                        user: meeting.currentAgendaItem.user,
                                        topic: 'Presenting: ' + meeting.currentAgendaItem.name,
                                        type: 'topic'
                                    };
                                }
                                else {
                                    // not sure if this can happen with current meeting flow
                                    meeting.currentSpeaker = undefined;
                                }
                                meeting.currentTopic = undefined;
                            }
                            else {
                                meeting.currentSpeaker = meeting.queuedSpeakers.shift();
                                if (meeting.currentSpeaker.type === 'topic') {
                                    meeting.currentTopic = meeting.currentSpeaker;
                                }
                            }
                            return [4 /*yield*/, db_1.updateMeeting(meeting)];
                        case 2:
                            _a.sent();
                            respond(200);
                            /*
                            emitAll(Message.Type.newCurrentSpeaker, meeting.currentSpeaker);
                            if (oldTopic !== meeting.currentTopic) {
                              emitAll(Message.Type.newCurrentTopic, meeting.currentTopic);
                            }
                            */
                            emitAll(Message.Type.state, meetingToState(meeting));
                            return [2 /*return*/];
                    }
                });
            });
        }
        function instrumentSocketFn(fn) {
            var start;
            function respond(status, message) {
                if (!message)
                    message = {};
                message.status = status;
                socket.emit(Message.Type.Response, message);
                telemetry_1.default.trackRequest({
                    resultCode: String(status),
                    name: 'WebSocket Handler: ' + fn.name,
                    duration: Date.now() - start,
                    url: socket.handshake.url,
                    success: String(status)[0] === '2'
                });
            }
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                start = Date.now();
                return waitTurn(function () { return fn.call.apply(fn, [undefined, respond].concat(args)); });
            };
        }
        function disconnect() {
            socks.delete(socket);
        }
        var meetingId, githubUser, ghapi, user, meeting;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!socket.handshake.session || !socket.handshake.session.passport) {
                        // not logged in I guess? Or session not found?
                        console.log('disconnecting due to bad session');
                        socket.disconnect();
                        return [2 /*return*/];
                    }
                    meetingId = socket.handshake.query.id;
                    if (!meetingId) {
                        console.log('disconnecting socket due to bad meeting id');
                        socket.disconnect();
                        return [2 /*return*/];
                    }
                    socks.add(socket);
                    githubUser = socket.handshake.session.passport.user;
                    ghapi = ghapi_1.default(githubUser.accessToken);
                    user = {
                        name: githubUser.name,
                        organization: githubUser.organization,
                        ghid: githubUser.ghid,
                        ghUsername: githubUser.ghUsername
                    };
                    return [4 /*yield*/, db_1.getMeeting(meetingId)];
                case 1:
                    meeting = _a.sent();
                    socket.emit(Message.Type.state, meetingToState(meeting));
                    socket.on(Message.Type.newQueuedSpeakerRequest, instrumentSocketFn(newTopic));
                    socket.on(Message.Type.nextSpeaker, instrumentSocketFn(nextSpeaker));
                    socket.on(Message.Type.disconnect, disconnect);
                    socket.on(Message.Type.newAgendaItemRequest, instrumentSocketFn(newAgendaItem));
                    socket.on(Message.Type.reorderAgendaItemRequest, instrumentSocketFn(reorderAgendaItem));
                    socket.on(Message.Type.deleteAgendaItemRequest, instrumentSocketFn(deleteAgendaItem));
                    socket.on(Message.Type.nextAgendaItemRequest, instrumentSocketFn(nextAgendaItem));
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = connection;
function emitAll(type) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    socks.forEach(function (s) {
        // sad cast is sad
        s.emit.apply(s, [type].concat(args));
    });
}
function timeout(t) {
    return new Promise(function (res) {
        setTimeout(function () { return res(); }, t);
    });
}
