export const HOST = 'https://tcq.documents.azure.com:443/';
export const DATABASE_ID = 'tcq';
export const COLLECTION_ID = 'items';
export const SESSION_COLLECTION_ID = 'sessions';

import { CDB_SECRET } from './secrets';
import * as docdb from 'documentdb-typescript';
import Speaker from '../shared/Speaker';
import Meeting from '../shared/Meeting';
import { DocumentResource } from 'documentdb-typescript/typings/_DocumentDB';

const meetingsCollection = getMeetingsCollection();

export async function updateMeeting(meeting: Meeting) {
  let collection = await meetingsCollection;
  await collection.storeDocumentAsync(meeting, docdb.StoreMode.UpdateOnly);
}

export async function getMeeting(meetingId: string) {
  let collection = await meetingsCollection;

  return (await collection.findDocumentAsync(meetingId)) as Meeting & DocumentResource;
}

export async function createMeeting(meeting: Meeting) {
  let collection = await meetingsCollection;

  return collection.storeDocumentAsync(meeting);
}

export async function getMeetingsCollection() {
  return new docdb.Collection(COLLECTION_ID, DATABASE_ID, HOST, CDB_SECRET).openAsync();
}

const reUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validUUID(seen: Set<string>, uuid: string) {
  if (seen.has(uuid)) return false;
  if (!reUUID.exec(uuid)) return false;

  return true;
}
