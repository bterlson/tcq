import * as GHA from 'github';

var v: GHA.SearchUsersParams;

export default function(token: string) {
  const gha = new GHA();
  gha.authenticate({
    type: 'oauth',
    token: token
  });

  return gha;
}
