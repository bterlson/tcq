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
import { Meeting } from './database-types';
import { ensureLoggedIn } from 'connect-ensure-login';
import { resolve as resolvePath } from 'path';

function wrap(fn: (req: express.Request, res: express.Response) => Promise<void>) {
  return function(req: express.Request, res: express.Response, next: any): void {
    fn(req, res)
      .then(() => {
        console.log('in wrapper, nexting');
        //return next();
      })
      .catch(next);
  };
}

const router = Router();
router.get('/', async (req, res) => {
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
    let path = resolvePath(__dirname, '../client/index.html');
    res.sendFile(path);
  } else {
    res.status(200);
    res.send('Sign in on GitHub: <a href="/auth/github">here</a>');
    res.end();
  }
});

router.get('/login', function(req, res) {
  res.redirect('/auth/github');
});

router.get('/auth/github', passport.authenticate('github'));
router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
    return;
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
  ensureLoggedIn(),
  wrap(async function(req, res) {
    const id = req.params['id'];
    if (id === '1') {
      /*
      const database = await getDatabaseById(DATABASE_ID);
      const collection = await getCollectionById('items', database);
      const document = await getDocumentById(id, collection);
      */
    } else {
      res.status(400);
      res.end();
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
