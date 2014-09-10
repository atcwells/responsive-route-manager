var _ = require('lodash-node');
var hound = require('hound');
var bodyParser = require('body-parser');

module.exports = ResponsiveRouteManager = function ResponsiveRouteManager(optionsObj, expressApp) {
    var self = this;

    self.expressApp = expressApp;
    var options = optionsObj || {};

    self.expressApp.use(bodyParser.json());
    self.watcher = hound.watch(process.env.PWD + options.folder);
    self.logger = {
        debug : (options.logger && options.logger.debug) || console.log,
        info : (options.logger && options.logger.info) || console.log,
        warn : (options.logger && options.logger.war) || console.log,
        error : (options.logger && options.logger.error) || console.log
    };
    self.clientType = options.clientType;
    self.mountPath = options.mountPath || 'api';
    self.folder = process.env.PWD + options.folder;

    self.setupFileWatching();

    var apiDef = require('./client_types/' + self.clientType);
    apiDef.prototype.logger = self.logger;
    self[self.clientType] = new apiDef(self.mountPath, self.expressApp);
    
    self.discoverFiles(self.folder, function(files) {
        for (var file in files) {
            self[self.clientType].configureRoute(files[file]);
        }
    });
	self.startup();
};

ResponsiveRouteManager.prototype.startup = function init() {
	var self = this;
	
    var apiDef = require('./client_types/' + self.clientType);
    apiDef.prototype.logger = self.logger;
    self[self.clientType] = new apiDef(self.mountPath, self.expressApp);

    self.discoverFiles(self.folder, function(files) {
        for (var file in files) {
            self[self.clientType].configureRoute(files[file]);
        }
    });
};

ResponsiveRouteManager.prototype.shutdown = function() {
	this[this.clientType] = null;
};

ResponsiveRouteManager.prototype.changeMountPath = function changeMountPath(mountPath) {
	var self = this;
	self.mountPath = mountPath;
	self.startup();
};

ResponsiveRouteManager.prototype.discoverFiles = function discoverFiles(folder, callback) {
    var fs = require('fs-extra');
    var apiFilesArr = [];

    fs.readdir(folder + '/', function(err, files) {
        for (var file in files) {
            if (!fs.statSync(folder + '/' + files[file]).isDirectory()) {
                apiFilesArr.push(folder + '/' + files[file]);
            };
        }
        callback(apiFilesArr);
    });
};

ResponsiveRouteManager.prototype.setupFileWatching = function setupFileWatching() {
    var self = this;
    self.watcher.on('create', function(file, stats) {
        self[self.clientType].configureRoute(file);
    });
    self.watcher.on('change', function(file, stats) {
        self[self.clientType].configureRoute(file);
    });
    self.watcher.on('delete', function(file, stats) {
        self[self.clientType].destroyRoute(file);
    });
};

ResponsiveRouteManager.prototype.getRoutes = function getRoutes() {
    var routes = {};
    for (var apiKey in this[this.clientType].publicAPI) {
        routes[apiKey] = [];
        if (_.isFunction(this[this.clientType].publicAPI[apiKey])) {
            var fn = new this[this.clientType].publicAPI[apiKey]();
            for (var fnKey in fn) {
                if (fn[fnKey] && _.isFunction(fn[fnKey])) {
                    routes[apiKey].push(fnKey);
                };
            }
        }
    }
    return routes;
};

