export default interface GitHubAuthenticatedUser {
  name: string;
  company: string;
  ghid: string;
  accessToken: string;
  refreshToken: string;
};
