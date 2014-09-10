var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash-node');

module.exports = static = function static(mountPath, expressApp) {
    var self = this;
    self.expressApp = expressApp;
    self.mountPath = mountPath;
    self.publicAPI = {};

    self.logger.info('Creating mount path at [' + this.mountPath + ']');
    expressApp.use('/' + self.mountPath, function(request, response, next) {
        response.message = {
            error : true,
            errorMessage : 'ERROR: API call /' + self.mountPath + '/' + request.path + ' not found.',
            data : {}
        };
        next();
    });
};

static.prototype.unmountRoute = function(route) {
	
};

static.prototype.mountRoute = function configureRoute(file) {
	
};

static.prototype.interpretFile = function interpretFile(file) {
	
};
