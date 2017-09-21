import * as db from './db';
import {
  DocumentClient,
  DatabaseMeta,
  QueryError,
  SqlQuerySpec,
  CollectionMeta,
  RetrievedDocument,
  NewDocument
} from 'documentdb';
import { CDB_SECRET } from './secrets';
import { Meeting } from './database-types';

const host = db.HOST;
const masterKey = CDB_SECRET;
const client = new DocumentClient(host, { masterKey: masterKey });

const databaseDefinition = { id: db.DATABASE_ID };
const collectionDefinition = { id: db.COLLECTION_ID };
const documentDefinition = { id: 'hello world doc', content: 'Hello World!' };

export function createDocument(
  collection: CollectionMeta,
  newDocument: NewDocument
): Promise<RetrievedDocument> {
  return new Promise((resolve, reject) => {
    client.createDocument(collection._self, newDocument, (err, resource) => {
      if (err) {
        reject(err);
      } else {
        resolve(resource);
      }
    });
  });
}

export function replaceDocument<T extends RetrievedDocument>(
  collection: CollectionMeta,
  originalDocument: RetrievedDocument,
  updates: Partial<T>
): Promise<RetrievedDocument> {
  const updatedDocument = { ...originalDocument, ...updates as any } as T;
  return new Promise((resolve, reject) => {
    client.replaceDocument(collection._self, updatedDocument, (err, resource) => {
      if (err) {
        reject(err);
      } else {
        resolve(resource);
      }
    });
  });
}

export function getDatabaseById(id: string): Promise<DatabaseMeta> {
  return new Promise((resolve, reject) => {
    client
      .queryDatabases(makeIdQuery(id))
      .toArray(queryResolverRejecter('database', resolve, reject));
  });
}

export function getCollectionById(id: string, database: DatabaseMeta): Promise<CollectionMeta> {
  return new Promise((resolve, reject) => {
    client
      .queryCollections(database._self, makeIdQuery(id))
      .toArray(queryResolverRejecter('collection', resolve, reject));
  });
}

export function getDocumentById(
  id: string,
  collection: CollectionMeta
): Promise<RetrievedDocument> {
  return new Promise((resolve, reject) => {
    client
      .queryDocuments(collection._self, makeIdQuery(id))
      .toArray(queryResolverRejecter('document', resolve, reject));
  });
}

function makeIdQuery(id: string): SqlQuerySpec {
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

function queryResolverRejecter<T>(
  resourceType: string,
  resolve: (element: T) => void,
  reject: (err: any) => void
) {
  return (err: QueryError, resource: T[]) => {
    if (err) {
      reject(err);
    } else if (resource.length !== 1) {
      reject(
        new Error(
          `Expected a single ${resourceType} of a given ID, got ${resource.length}:\n` +
            JSON.stringify(resource)
        )
      );
    } else {
      resolve(resource[0]);
    }
  };
}

/*
client.readDatabases().forEach((err, database) => {
  if (handleIteration(err, database)) {
    return;
  }

  console.log(JSON.stringify(database));
  console.log('id' in database);

  console.log(`Database id: ${database.id}`);
  client.readCollections(database._self).forEach((err, collection) => {
    if (handleIteration(err, collection)) {
      return;
    }

    console.log(`  Collection id: ${collection.id}`);
    client.readDocuments(collection._self).forEach((err, document) => {
      if (handleIteration(err, document)) {
        return;
      }

      console.log(`    ${JSON.stringify(document)}`);
  });
})

function handleIteration(err: QueryError, meta: {} | undefined) {
  if (err) {
    console.error(err);
    return true;
  }
  if (!meta) {
    return true;
  }
  return false;
}

/**
 client.createDatabase(databaseDefinition, function(err, database) {
   if (err) return console.log(err);
   console.log('created db');

   client.createCollection(database._self, collectionDefinition, function(err, collection) {
     if (err) return console.log(err);
     console.log('created collection');

     client.createDocument(collection._self, documentDefinition, function(err, document) {
       if (err) return console.log(err);
       console.log('Created Document with content: ', document.content);

       cleanup(client, database);
     });
   });
 });

 function cleanup(client: DocumentClient, database: DatabaseMeta) {
   client.deleteDatabase(database._self, function(err) {
     if (err) console.log(err);
   });
 }
 */
