var path = require('path');
var _ = require('lodash-node');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = functionalAPI = function functionalAPI(mountPath, expressApp) {
    var self = this;
    self.expressApp = expressApp;
    self.expressApp.use(bodyParser.json());
    self.mountPath = mountPath;
    self.publicAPI = {};

    self.logger.info('Creating mount path at [' + this.mountPath + ']');

    self.expressapp.use(passport.initialize());
    self.expressapp.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    self.expressApp.use('/' + self.mountPath, function(request, response, next) {
      
    });
};

functionalAPI.prototype.mountRoute = function configureRoute(file) {
};

functionalAPI.prototype.interpretFile = function interpretFile(file) {
};
