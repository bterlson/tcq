"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var db = require("./db");
var documentdb_1 = require("documentdb");
var secrets_1 = require("./secrets");
var host = db.HOST;
var masterKey = secrets_1.CDB_SECRET;
var client = new documentdb_1.DocumentClient(host, { masterKey: masterKey });
var databaseDefinition = { id: db.DATABASE_ID };
var collectionDefinition = { id: db.COLLECTION_ID };
var documentDefinition = { id: 'hello world doc', content: 'Hello World!' };
function createDocument(collection, newDocument) {
    return new Promise(function (resolve, reject) {
        client.createDocument(collection._self, newDocument, function (err, resource) {
            if (err) {
                reject(err);
            }
            else {
                resolve(resource);
            }
        });
    });
}
exports.createDocument = createDocument;
function replaceDocument(collection, originalDocument, updates) {
    var updatedDocument = __assign({}, originalDocument, updates);
    return new Promise(function (resolve, reject) {
        client.replaceDocument(collection._self, updatedDocument, function (err, resource) {
            if (err) {
                reject(err);
            }
            else {
                resolve(resource);
            }
        });
    });
}
exports.replaceDocument = replaceDocument;
function getDatabaseById(id) {
    return new Promise(function (resolve, reject) {
        client
            .queryDatabases(makeIdQuery(id))
            .toArray(queryResolverRejecter('database', resolve, reject));
    });
}
exports.getDatabaseById = getDatabaseById;
function getCollectionById(id, database) {
    return new Promise(function (resolve, reject) {
        client
            .queryCollections(database._self, makeIdQuery(id))
            .toArray(queryResolverRejecter('collection', resolve, reject));
    });
}
exports.getCollectionById = getCollectionById;
function getDocumentById(id, collection) {
    return new Promise(function (resolve, reject) {
        client
            .queryDocuments(collection._self, makeIdQuery(id))
            .toArray(queryResolverRejecter('document', resolve, reject));
    });
}
exports.getDocumentById = getDocumentById;
function makeIdQuery(id) {
    return {
        query: 'SELECT * FROM root r WHERE r.id=@id',
        parameters: [
            {
                name: '@id',
                value: id
            }
        ]
    };
}
function queryResolverRejecter(resourceType, resolve, reject) {
    return function (err, resource) {
        if (err) {
            reject(err);
        }
        else if (resource.length !== 1) {
            reject(new Error("Expected a single " + resourceType + " of a given ID, got " + resource.length + ":\n" +
                JSON.stringify(resource)));
        }
        else {
            resolve(resource[0]);
        }
    };
}
