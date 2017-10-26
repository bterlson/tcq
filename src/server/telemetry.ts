import * as secrets from './secrets';
import * as ai from 'applicationinsights';
ai.setup(secrets.AI_IKEY).start();
let client = ai.defaultClient;

export default client;
