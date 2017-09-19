import { Router } from 'express';
import passport from './passport';
import gha from './ghapi';
import * as express from 'express';

function wrap(fn: (req: express.Request, res: express.Response) => Promise<void>) {
  return function(req: express.Request, res: express.Response, next: any): void {
    fn(req, res).then((returnVal:any) => res.send(returnVal)).catch(next);
  };
}

const router = Router();
router.get('/',
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
    res.sendFile('')
    res.end();
  } else {
    res.status(200);
    res.send('Sign in on GitHub: <a href="/auth/github">here</a>');
    res.end();
  }
}));

router.get('/auth/github', passport.authenticate('github'));
router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
});

export default router;