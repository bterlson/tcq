import User from '../shared/User';
import GitHubAuthenticatedUser from '../shared/GitHubAuthenticatedUser';
import axios from 'axios';
import Meeting from '../shared/Meeting';

const knownUsers = new Map<string, User>();

export function addKnownUser(user: User) {
  knownUsers.set(user.ghUsername, user);
}

export async function getByUsername(username: string, accessToken: string) {
  const known = knownUsers.get(username);
  if (known) return known;

  let res;
  try {
    // I would expect to use ghapi for this, but it doesn't offer this endpoind.
    // TODO: investigate rate limiting on this API?
    res = await axios.get(
      'https://api.github.com/users/' + username + '?access_token=' + accessToken
    );
  } catch (e) {
    console.log('failed getting user ' + username);
    throw e;
  }
  let user: User = {
    ghid: res.data.id,
    ghUsername: username,
    name: res.data.name,
    organization: res.data.company
  };
  addKnownUser(user);
  return user;
}

export async function getByUsernames(usernames: string[], accessToken: string) {
  return Promise.all(
    usernames.map(async u => {
      try {
        return await getByUsername(u, accessToken);
      } catch (e) {
        throw new Error(`Couldn't find user '${u}'.`);
      }
    })
  );
}

export function fromGHAU(user: GitHubAuthenticatedUser): User {
  return {
    name: user.name,
    organization: user.organization,
    ghid: user.ghid,
    ghUsername: user.ghUsername
  };
}

export function isChair(user: GitHubAuthenticatedUser | User, meeting: Meeting) {
  return meeting.chairs.length === 0 || meeting.chairs.some(c => c.ghid === user.ghid);
}

export default User;
