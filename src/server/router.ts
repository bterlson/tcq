import { Router } from 'express';
import passport from './passport';
import gha from './ghapi';
import * as express from 'express';
import {
  getDatabaseById,
  getCollectionById,
  createDocument,
  getDocumentById
} from './promisifed-docdb';
import { DATABASE_ID } from './db';
import uuid = require('uuid');
import { Meeting, DocumentDB } from './database-types';

function wrap(fn: (req: express.Request, res: express.Response) => Promise<void>) {
  return function(req: express.Request, res: express.Response, next: any): void {
    fn(req, res)
      .then((returnVal: any) => res.send(returnVal))
      .catch(next);
  };
}

const router = Router();
router.get(
  '/',
  wrap(async (req, res) => {
    if (req.isAuthenticated()) {
      let membership;

      try {
        membership = await gha(req.user.accessToken).users.getOrgMembership({ org: 'tc39' });
      } catch (e) {
        console.error(e);
        res.status(404);
        res.send('Not a member!');
        res.end();
        return;
      }

      res.status(200);
      res.sendFile('');
      res.end();
    } else {
      res.status(200);
      res.send('Sign in on GitHub: <a href="/auth/github">here</a>');
      res.end();
    }
  })
);

router.get('/auth/github', passport.authenticate('github'));
router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

router.get(
  '/makemeeting',
  wrap(async function(req, res) {
    try {
      const database = await getDatabaseById(DATABASE_ID);
      const items = await getCollectionById('items', database);
      createDocument(items, meeting);
      res.send(meeting.id);
      res.status(200);
    } catch (e) {
      console.error(e);
      res.status(500);
      res.end();
    }
  })
);

router.get(
  '/meeting/:id',
  wrap(async function(req, res) {
    const id = req.params['id'];
    try {
      const database = await getDatabaseById(DATABASE_ID);
      const collection = await getCollectionById('items', database);
      const document = await getDocumentById(id, collection);
      res.json(document);
      res.end();
    } catch (e) {
      res.status(400);
    }
  })
);

const currentSpeaker = {
  id: uuid(),
  firstName: 'Brian',
  lastName: 'Terlson',
  organization: 'Microsoft'
};

const queuedSpeakers = [
  { firstName: 'Daniel', lastName: 'Rosenwasser', organization: 'Microsoft' },
  { firstName: 'Yehuda', lastName: 'Katz', organization: 'Tilde' },
  { firstName: 'David', lastName: 'Herman', organization: 'LinkedIn' },
  { firstName: 'aaa', lastName: '', organization: '' },
  { firstName: 'bbb', lastName: '', organization: '' },
  { firstName: 'ccc', lastName: '', organization: '' },
  { firstName: 'ddd', lastName: '', organization: '' },
  { firstName: 'eee', lastName: '', organization: '' },
  { firstName: 'fff', lastName: '', organization: '' }
].map((speaker, id) => ({ ...speaker, id: uuid() }));

const meeting: Meeting = {
  id: uuid(),
  currentSpeaker,
  queuedSpeakers
};

export default router;
