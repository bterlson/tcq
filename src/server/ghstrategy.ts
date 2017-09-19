import { Strategy as GitHubStrategy } from 'passport-github';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET} from './secrets';
import Delegate from './delegate';

export default new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    scope: ['user:email', 'read:org'],
  },
  function(accessToken, refreshToken, profile, cb) {
    let d = new Delegate();
    d.name = profile.displayName;
    d.company = (<any>profile)._json.company;
    d.accessToken = accessToken;
    d.refreshToken = refreshToken;

    cb(null, d);
  }
);