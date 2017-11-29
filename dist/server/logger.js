"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bunyan = require("bunyan");
var log = bunyan.createLogger({ name: 'tcq' });
exports.default = log;
