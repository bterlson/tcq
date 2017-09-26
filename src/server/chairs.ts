let chairs = new Set([
  '11236' /* brian */,
  '972891' /* daniel */,
  '189835' /* littledan */,
  '301201' /* leo balter */,
  '6708936' /* rex */
]);
export function isChair(userid: string) {
  return chairs.has(userid);
}
