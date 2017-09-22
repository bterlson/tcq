import * as secrets from './secrets';
import * as express from 'express';
import passport from './passport';
import routes from './router';

const app = express();

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(
  require('express-session')({
    secret: secrets.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('dist/client/'));
app.use(routes);
app.listen(3000);

export default app;
