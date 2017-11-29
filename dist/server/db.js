"use strict";
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
exports.HOST = 'https://tcq.documents.azure.com:443/';
exports.DATABASE_ID = 'tcq';
exports.COLLECTION_ID = 'items';
exports.SESSION_COLLECTION_ID = 'sessions';
var secrets_1 = require("./secrets");
var docdb = require("documentdb-typescript");
var meetingsCollection = getMeetingsCollection();
function updateMeeting(meeting) {
    return __awaiter(this, void 0, void 0, function () {
        var collection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, meetingsCollection];
                case 1:
                    collection = _a.sent();
                    return [4 /*yield*/, collection.storeDocumentAsync(meeting, docdb.StoreMode.UpdateOnly)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateMeeting = updateMeeting;
function getMeeting(meetingId) {
    return __awaiter(this, void 0, void 0, function () {
        var collection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, meetingsCollection];
                case 1:
                    collection = _a.sent();
                    return [4 /*yield*/, collection.findDocumentAsync(meetingId)];
                case 2: return [2 /*return*/, (_a.sent())];
            }
        });
    });
}
exports.getMeeting = getMeeting;
function createMeeting(meeting) {
    return __awaiter(this, void 0, void 0, function () {
        var collection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, meetingsCollection];
                case 1:
                    collection = _a.sent();
                    return [2 /*return*/, collection.storeDocumentAsync(meeting)];
            }
        });
    });
}
exports.createMeeting = createMeeting;
function getMeetingsCollection() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new docdb.Collection(exports.COLLECTION_ID, exports.DATABASE_ID, exports.HOST, secrets_1.CDB_SECRET).openAsync()];
        });
    });
}
exports.getMeetingsCollection = getMeetingsCollection;
var reUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validUUID(seen, uuid) {
    if (seen.has(uuid))
        return false;
    if (!reUUID.exec(uuid))
        return false;
    return true;
}
