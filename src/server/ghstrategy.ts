import { Strategy as GitHubStrategy } from 'passport-github';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from './secrets';
import GHAuthUser from '../shared/GitHubAuthenticatedUser';
import { addKnownUser, fromGHAU } from './User';
const callbackURL =
  process.env.NODE_ENV === 'production'
    ? 'http://tcq.app/auth/github/callback'
    : 'http://127.0.0.1:3000/auth/github/callback';

export default new GitHubStrategy(
  {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL,
    scope: ['user:email']
  },
  function(accessToken, refreshToken, profile, cb) {
    let user: GHAuthUser = {
      name: profile.displayName,
      ghUsername: profile.username!, // why might this be undefined?
      organization: (<any>profile)._json.company,
      accessToken,
      refreshToken,
      ghid: Number(profile.id) // I think this is already a number for the github API
    };

    addKnownUser(fromGHAU(user));
    cb(null, user);
  }
);
