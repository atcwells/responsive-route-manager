var path = require('path');
var _ = require('lodash-node');
var bodyParser = require('body-parser');
var hound = require('hound');
var shell = require('shelljs');

module.exports = functionalAPI = function functionalAPI(options, expressApp, callback) {
  var self = this;
  self.expressApp = expressApp;
  self.options = options;
  self.expressApp.use(bodyParser.json());
  self.publicAPI = {};
  self.watcher = hound.watch(shell.pwd() + self.options.folder);

  self.logger = {
    debug : (options.logger && options.logger.debug) || console.log,
    info : (options.logger && options.logger.info) || console.log,
    warn : (options.logger && options.logger.war) || console.log,
    error : (options.logger && options.logger.error) || console.log
  };

  self.logger.info('Creating mount path at [' + self.options.mountPath + ']');

  self.expressApp.use('/' + self.options.mountPath, function(request, response, next) {
    response.message = {
      error : true,
      errorMessage : 'ERROR: API call /' + self.mountPath + '/' + request.path + ' not found.',
      data : {}
    };
    next();
  });
};

functionalAPI.prototype.startup = function(callback) {
  var self = this;
  self._setupFileWatching();
  self._discoverFiles(shell.pwd() + self.options.folder, function(files) {
    for (var file in files) {
      self._mountRoute(files[file]);
    }
    callback(null, "Functional API started successfully");
  });
};

functionalAPI.prototype.shutdown = function(callback) {
  this._unmountRoute('/' + this.options.mountPath);
  this.watcher.clear();
  callback(null, "Functional API shutdown successfully");
};

functionalAPI.prototype.changeMountPath = function(mountPath, callback) {
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

functionalAPI.prototype.getRoutes = function(callback) {
  var routes = {};
  routes[this.options.mountPath] = {};
  for (var apiKey in this.publicAPI) {
    routes[this.options.mountPath][apiKey] = [];
    var fn = new this.publicAPI[apiKey]();
    for (var fnKey in fn) {
      if (fn[fnKey] && _.isFunction(fn[fnKey])) {
        routes[this.options.mountPath][apiKey].push(fnKey);
      };
    }
  }
  callback(null, routes);
};

functionalAPI.prototype._mountRoute = function(file) {
  var self = this;
  var file = self._interpretFile(file);
  if (file && file.properties && file.properties.name && _.isFunction(self.publicAPI[file.properties.name])) {
  	if(!self.expressApp[file.properties.verb]) {
      self.logger.error('Unable to Configure route using API file [' + file + ']');
      return undefined;
    }

    var route = '/' + self.options.mountPath + '/' + file.properties.name + '/:method';
    self.logger.info('Mounting route at [' + route + ']');
    self.expressApp[file.properties.verb](route, function(request, response, next) {
      response.message = {};
      var api = new self.publicAPI[file.properties.name](request, response, function() {
        if (response && !response.headerSent) {
          if (!response.message.error) {
            delete response.message.errorMessage;
          }
          response.writeHead(200, {
            'content-type' : 'application/json'
          });
          response.end(")]}',\n" + JSON.stringify(response.message));
        }
      });
      api[request.params.method](request.body);
    });
  } else {
    self.logger.error('Unable to Configure route using API file [' + file + ']');
  }
};

functionalAPI.prototype._unmountRoute = function(route) {
  for (var i = 0, len = this.expressApp._router.stack.length; i < len; ++i) {
    if (this.expressApp._router.stack[i] && this.expressApp._router.stack[i].route && this.expressApp._router.stack[i].route.path.indexOf(route) == 0) {
      this.logger.info('Unmounting Route at [' + this.expressApp._router.stack[i].route.path + ']');
      this.expressApp._router.stack.splice(i, 1);
      i--;
    };
  }
  return false;
};

functionalAPI.prototype._setupFileWatching = function() {
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

functionalAPI.prototype._discoverFiles = function(folder, callback) {
  var fs = require('fs');
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

functionalAPI.prototype._interpretFile = function(file) {
  var self = this;
  delete require.cache[file];
  var api = require(file);
  self.publicAPI[path.basename(file).slice(0, path.basename(file).length - 3)] = api;
  if (api && _.isFunction(api)) {
    var apiInstance = new api();
    var apiFunctions = {};
    for (var key in apiInstance) {
      if (_.isFunction(apiInstance[key])) {
        apiFunctions[key] = apiInstance[key];
      }
    }
    return {
      api : apiFunctions,
      properties : apiInstance.properties
    };
  } else {
    return undefined;
  }
};
