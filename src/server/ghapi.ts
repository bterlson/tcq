import { Octokit } from '@octokit/rest';

export default function(token: string) {
  const gha = new Octokit({
    type: 'oauth',
    token: token,
  });
  return gha;
}
