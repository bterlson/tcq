import User from './User';
export default interface GitHubAuthenticatedUser extends User {
  accessToken: string;
  refreshToken: string;
};
