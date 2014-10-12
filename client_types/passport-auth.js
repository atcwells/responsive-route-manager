var path = require('path');
var _ = require('lodash-node');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = passportAPI = function passportAPI(options, expressApp) {
    var self = this;
    self.expressApp = expressApp;
    self.expressApp.use(bodyParser.json());
    self.options = options;
    self.publicAPI = {};

    self.logger = {
      debug : (options.logger && options.logger.debug) || console.log,
      info : (options.logger && options.logger.info) || console.log,
      warn : (options.logger && options.logger.war) || console.log,
      error : (options.logger && options.logger.error) || console.log
    };

    self.logger.info('Creating mount path at [' + this.mountPath + ']');

    self.expressApp.use(passport.initialize());
    self.expressApp.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(new LocalStrategy(function(username, password, done) {
      var MongoClient = require('mongodb').MongoClient;
      MongoClient.connect(self.options.mongoUri, function(err, db) {
          if (err)
              return done(err);

          var collection = db.collection(self.options.userTable);
          collection.find({
              username : username
          }).toArray(function(err, user) {
              db.close();
              if (!user || (user && user.length && user.length == 0)) {
                  return done(null, false, {
                      message : 'Incorrect username.'
                  });
              }
              if (password !== user[0].password) {
                  return done(null, false, {
                      message : 'Incorrect password.'
                  });
              }
              return done(null, user);
          });
      });
    }));
};

passportAPI.prototype.startup = function(callback) {
  var self = this;
  self.publicAPI = {};
  self.publicAPI[self.options.mountPath] = [
    'login',
    'logout'
  ];
  self._setupAuthRoutes(callback);
};

passportAPI.prototype.shutdown = function(callback) {
  this._unmountRoute('/' + this.options.mountPath);
  callback(null, "Functional API shutdown successfully");
};

passportAPI.prototype._unmountRoute = function(route) {
  for (var i = 0, len = this.expressApp._router.stack.length; i < len; ++i) {
    if (this.expressApp._router.stack[i] && this.expressApp._router.stack[i].route && this.expressApp._router.stack[i].route.path.indexOf(route) == 0) {
      this.logger.info('Unmounting Route at [' + this.expressApp._router.stack[i].route.path + ']');
      this.expressApp._router.stack.splice(i, 1);
      i--;
    };
  }
  return false;
};

passportAPI.prototype.changeMountPath = function changeMountPath(mountPath, callback) {
  var self = this;
  this.shutdown(function(err, msg) {
    if(err) {
      callback(err, msg);
    } else {
      self.options.mountPath = mountPath;
      self.startup(callback);
    }
  })
};

passportAPI.prototype.getRoutes = function getRoutes(callback) {
  return this.publicAPI;
};

passportAPI.prototype._setupAuthRoutes = function getRoutes(callback) {
  var self = this;
  self.expressApp.post('/' + self.options.mountPath + '/login', function(req, res, next) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/');
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
    })(req, res, next);
  });

  self.expressApp.post('/' + self.options.mountPath + '/logout', function(req, res) {
      req.logout();
      res.writeHead(200, {
          'content-type' : 'application/json'
      });
      res.end("logout success");
  });

  callback(null, "Auth Routes setup");
};
