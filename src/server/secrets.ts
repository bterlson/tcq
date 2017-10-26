import log from './logger';

const prod = process.env.NODE_ENV === 'production';

export const GITHUB_CLIENT_SECRET = prod
  ? process.env['TCQ_GH_SECRET']!
  : process.env['TCQ_LOCAL_GH_SECRET']!;
export const GITHUB_CLIENT_ID = prod ? process.env['TCQ_GH_ID']! : process.env['TCQ_LOCAL_GH_ID']!;
export const SESSION_SECRET = process.env['TCQ_SESSION_SECRET']!;
export const CDB_SECRET = process.env['TCQ_CDB_SECRET']!;
export const AI_IKEY = process.env['TCQ_AI_IKEY'];

if (!GITHUB_CLIENT_SECRET) {
  log.fatal('ERROR\tNo client secret. Set TCQ_GH_SECRET.');
  process.exit(1);
}

if (!GITHUB_CLIENT_ID) {
  log.fatal('ERROR\tNo client id. Set TCQ_GH_ID.');
  process.exit(1);
}

if (!SESSION_SECRET) {
  log.fatal('ERROR\tNo session secret. Set TCQ_SESSION_SECRET.');
  process.exit(1);
}

if (!CDB_SECRET) {
  log.fatal('ERROR\tNo CosmosDB secret. Set TCQ_CDB_SECRET.');
  process.exit(1);
}

if (!AI_IKEY) {
  log.fatal('ERROR\tNo Application Insights Instrumentation Key. Set TCQ_AI_IKEY.');
  process.exit(1);
}
