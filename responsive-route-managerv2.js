module.exports = function init(options, expressApp) {
  return new route_manager(options, expressApp);
};

var route_manager = function route_manager(optionsObj, expressApp) {
    var options = optionsObj || {};

    this.logger = {
        debug : (options.logger && options.logger.debug) || console.log,
        info : (options.logger && options.logger.info) || console.log,
        warn : (options.logger && options.logger.war) || console.log,
        error : (options.logger && options.logger.error) || console.log
    };

    var apiDef = require('./client_types/' + options.clientType);
    this.controller = new apiDef(options, expressApp);
};

route_manager.prototype.startup = function(callback) {
  this.controller.startup(callback);
};

route_manager.prototype.shutdown = function(callback) {
  this.controller.shutdown(callback);
};

route_manager.prototype.changeMountPath = function changeMountPath(mountPath, callback) {
  this.controller.changeMountPath(mountPath, callback);
};

route_manager.prototype.getRoutes = function getRoutes(callback) {
  this.controller.getRoutes(callback);
};
