"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var secrets = require("./secrets");
var ai = require("applicationinsights");
ai.setup(secrets.AI_IKEY).start();
var client = ai.defaultClient;
exports.default = client;
