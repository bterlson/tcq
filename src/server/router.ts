import { Router } from 'express';
import { Session } from 'express-session';
import passport from './passport';
import * as express from 'express';
import uuid = require('uuid');
import { isChair } from './chairs';
import Meeting from '../shared/Meeting';
import { ensureLoggedIn } from 'connect-ensure-login';
import { resolve as resolvePath } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';
import { createMeeting, getMeeting } from './db';
import * as b64 from 'base64-url';
import User, { getByUsername, fromGHAU, getByUsernames } from './User';

declare module 'express-session' {
  interface SessionData {
    meetingId: any;
  }
}

const rf = promisify(readFile);
import client from './telemetry';

const router = Router();
router.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    let user = fromGHAU(req.user);

    let path = resolvePath(__dirname, '../client/new.html');
    let contents = await rf(path, { encoding: 'utf8' });
    contents = contents.replace(
      '/head>',
      '/head><script>window.user = ' + JSON.stringify(user) + '</' + 'script>'
    );
    res.send(contents);
    res.end();
  } else {
    let path = resolvePath(__dirname, '../client/home.html');
    let contents = await rf(path, { encoding: 'utf8' });
    res.send(contents);
    res.end();
  }
});

router.get('/meeting/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    req.session!.meetingId = req.params.id;
    res.redirect('/login');
    return;
  }

  let meeting;
  try {
    meeting = await getMeeting(req.params.id);
  } catch (e) {
    res.status(404);
    res.send('Meeting not found.');
    res.end();
    return;
  }

  let path = resolvePath(__dirname, '../client/meeting.html');
  let contents = await rf(path, { encoding: 'utf8' });
  let clientData = `<script>window.ghid = "${req.user.ghid}"; window.isChair = ${isChair(
    req.user.ghid
  )}</script>`;

  // insert client data script prior to the first script so this data is available.
  let slicePos = contents.indexOf('<script');
  contents = contents.slice(0, slicePos) + clientData + contents.slice(slicePos);
  res.send(contents);
  res.end();
});

router.post('/meetings', async (req, res) => {
  res.contentType('json');
  let chairs: string = req.body.chairs.trim();

  if (typeof chairs !== 'string') {
    res.status(400);
    res.send({ message: 'Must specify chairs' });
    res.end;
    return;
  }

  // split by commas, trim, and replace leading @ from usernames
  let usernames: string[] = [];
  if (chairs.length > 0) {
    usernames = chairs.split(',').map(s => s.trim().replace(/^@/, ''));
  }

  let chairUsers: User[] = [];
  try {
    chairUsers = await getByUsernames(usernames, req.user.accessToken);
  } catch (e) {
    res.status(400);
    res.send({ message: e.message });
    res.end();
    return;
  }

  let id = b64.encode(
    [
      Math.floor(Math.random() * 2 ** 32),
      Math.floor(Math.random() * 2 ** 32),
      Math.floor(Math.random() * 2 ** 32)
    ],
    'binary'
  );

  let meeting: Meeting = {
    chairs: chairUsers,
    currentAgendaItem: undefined,
    currentSpeaker: undefined,
    currentTopic: undefined,
    timeboxEnd: undefined,
    timeboxSecondsLeft: undefined,
    agenda: [],
    queuedSpeakers: [],
    reactions: [],
    trackTemperature: false,
    id
  };

  await createMeeting(meeting);
  client.trackEvent({ name: 'New Meeting' });
  res.send(meeting);
  res.end();
});

router.get('/login', function (req, res) {
  client.trackEvent({ name: 'home-login', properties: { ref: req.query.ref } });
  res.redirect('/auth/github');
});

router.get('/auth/github', passport.authenticate('github'));
router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    if (req.session!.meetingId) {
      res.redirect('/meeting/' + req.session!.meetingId);
      delete req.session!.meetingId;
    } else {
      res.redirect('/');
    }
  }
);

router.get('/logout', function (req, res) {
  req.logout();
  if (req.session) {
    req.session.destroy(() => {
      // TODO: Handle errors here?
      res.redirect('/');
    });
  } else {
    // not sure this branch happens
    res.redirect('/');
  }
});

export default router;
