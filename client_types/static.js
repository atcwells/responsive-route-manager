var path = require('path');
var _ = require('lodash-node');
var hound = require('hound');
var shell = require('shelljs');

module.exports = staticAPI = function staticAPI(options, expressApp) {
    var self = this;
    self.options = options;
    self.expressApp = expressApp;
    self.publicAPI = {};
    self.watcher = hound.watch(shell.pwd() + self.options.folder);

    self.logger = {
      debug : (options.logger && options.logger.debug) || console.log,
      info : (options.logger && options.logger.info) || console.log,
      warn : (options.logger && options.logger.war) || console.log,
      error : (options.logger && options.logger.error) || console.log
    };

    self.logger.info('Creating mount path at [' + this.mountPath + ']');

    self.expressApp.use(self.options.mountPath, function(request, response, next) {
        next();
    });
};

staticAPI.prototype.startup = function(callback) {
  var self = this;
  self._setupFileWatching();
  self._discoverFiles(shell.pwd() + self.options.folder, function(files) {
    for (var file in files) {
      self._mountRoute(files[file]);
    }
    callback(null, "Functional API started successfully");
  });
};

staticAPI.prototype.shutdown = function(callback) {
  this._unmountRoute('/' + this.options.mountPath);
  this.watcher.clear();
  callback(null, "Functional API shutdown successfully");
};

staticAPI.prototype.changeMountPath = function(mountPath, callback) {
  var self = this;
  this.shutdown(function(err, msg) {
    if(err) {
      callback(err, msg)
    } else {
      self.options.mountPath = mountPath;
      self.startup(callback);
    }
  });
};

staticAPI.prototype.getRoutes = function(callback) {
  var routes = {};
  routes[this.options.mountPath] = {};
  for (var apiKey in this.publicAPI) {
    routes[this.options.mountPath][apiKey] = this.publicAPI[apiKey];
  }
  callback(null, routes);
};

staticAPI.prototype._mountRoute = function(file) {
  var self = this;
  var fileNameWithoutExtension = this._interpretFile(file);
  var route = '/' + self.options.mountPath + '/' + fileNameWithoutExtension;
  self.logger.info('Mounting route at [' + route + ']');
  self.expressApp.get(route, function(request, response, next) {
      response.sendFile(self.publicAPI[fileNameWithoutExtension].path);
  });
};

staticAPI.prototype._unmountRoute = function(route) {
  for (var i = 0, len = this.expressApp._router.stack.length; i < len; ++i) {
    if (this.expressApp._router.stack[i] && this.expressApp._router.stack[i].route && this.expressApp._router.stack[i].route.path.indexOf(route) == 0) {
      this.logger.info('Unmounting Route at [' + this.expressApp._router.stack[i].route.path + ']');
      this.expressApp._router.stack.splice(i, 1);
      i--;
    };
  }
  return false;
};

staticAPI.prototype._setupFileWatching = function() {
  var self = this;
  self.watcher.on('create', function(file, stats) {
    self[self.clientType]._mountRoute(file);
  });
  self.watcher.on('change', function(file, stats) {
    self[self.clientType]._mountRoute(file);
  });
  self.watcher.on('delete', function(file, stats) {
    self[self.clientType]._unmountRoute(file);
  });
};

staticAPI.prototype._discoverFiles = function(folder, callback) {
  var fs = require('fs');
  var apiFilesArr = [];

  fs.readdir(folder + '/', function(err, files) {
    for (var file in files) {
      if (!fs.statSync(folder + files[file]).isDirectory()) {
        apiFilesArr.push(folder + files[file]);
      };
    }
    callback(apiFilesArr);
  });
};

staticAPI.prototype._interpretFile = function(filePath) {
	var filetype = path.extname(filePath);
  var filename = path.basename(filePath);
  var fileNameWithoutExtension = filename.slice(0, filename.length - filetype.length);
  this.publicAPI[fileNameWithoutExtension] = {
  	path: filePath,
  	extension: filetype,
  };
  return fileNameWithoutExtension;
};
