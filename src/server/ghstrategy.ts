import { Strategy as GitHubStrategy } from 'passport-github';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from './secrets';
import GHAuthUser from '../shared/GitHubAuthenticatedUser';
const callbackURL =
  process.env.NODE_ENV === 'production'
    ? 'http://tcq.azurewebsites.net/auth/github/callback'
    : 'http://127.0.0.1:3000/auth/github/callback';

export default new GitHubStrategy(
  {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL,
    scope: ['user:email', 'read:org']
  },
  function(accessToken, refreshToken, profile, cb) {
    let user: GHAuthUser = {
      name: profile.displayName,
      company: (<any>profile)._json.company,
      accessToken,
      refreshToken,
      ghid: profile.id
    };

    cb(null, user);
  }
);
