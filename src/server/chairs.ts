let chairs = new Set(['11236' /* brian */, '972891' /* daniel */]);
export function isChair(userid: string) {
  return chairs.has(userid);
}
