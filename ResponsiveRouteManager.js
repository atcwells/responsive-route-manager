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
    self.startup();
};

ResponsiveRouteManager.prototype.startup = function init() {
    var self = this;

    var apiDef = require('./client_types/' + self.clientType);
    apiDef.prototype.logger = self.logger;
    self[self.clientType] = new apiDef(self.mountPath, self.expressApp);

    self.discoverFiles(self.folder, function(files) {
        for (var file in files) {
            self[self.clientType].mountRoute(files[file]);
        }
    });
};

ResponsiveRouteManager.prototype.shutdown = function() {
	this.unmountRoute('/' + this.mountPath);
};

ResponsiveRouteManager.prototype.changeMountPath = function changeMountPath(mountPath) {
    var self = this;
    self.shutdown();
    self.mountPath = mountPath;
    self.startup();
};


ResponsiveRouteManager.prototype.unmountRoute = function(route) {
    for (var i = 0, len = this.expressApp._router.stack.length; i < len; ++i) {
        if (this.expressApp._router.stack[i] && this.expressApp._router.stack[i].route && this.expressApp._router.stack[i].route.path.indexOf(route) == 0) {
            this.logger.info('Unmounting Route at [' + this.expressApp._router.stack[i].route.path + ']');
            this.expressApp._router.stack.splice(i, 1);
            i--;
        };
    }
    return false;
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
        self[self.clientType].mountRoute(file);
    });
    self.watcher.on('change', function(file, stats) {
        self[self.clientType].mountRoute(file);
    });
    self.watcher.on('delete', function(file, stats) {
        self[self.clientType].unmountRoute(file);
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

