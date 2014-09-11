var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash-node');

module.exports = static = function static(mountPath, expressApp) {
    var self = this;
    self.expressApp = expressApp;
    self.mountPath = mountPath;
    self.publicAPI = {};

    self.logger.info('Creating mount path at [' + this.mountPath + ']');

    self.expressApp.use(mountPath, function(request, response, next) {
        next();
    });
};

static.prototype.mountRoute = function configureRoute(file) {
    var self = this;
    var fileNameWithoutExtension = this.interpretFile(file);
    var route = '/' + self.mountPath + '/' + fileNameWithoutExtension;
    self.logger.info('Mounting route at [' + route + ']');
    self.expressApp.get(route, function(request, response, next) {
        response.sendFile(self.publicAPI[fileNameWithoutExtension].path);
    });
};

static.prototype.interpretFile = function interpretFile(filePath) {
	var filetype = path.extname(filePath);
    var filename = path.basename(filePath);
    var fileNameWithoutExtension = filename.slice(0, filename.length - filetype.length);
    this.publicAPI[fileNameWithoutExtension] = {
    	path: filePath,
    	extension: filetype,
    };
    return fileNameWithoutExtension;
};
