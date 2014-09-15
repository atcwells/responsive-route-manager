var path = require('path');
var _ = require('lodash-node');
var bodyParser = require('body-parser');

module.exports = functionalAPI = function functionalAPI(mountPath, expressApp) {
    var self = this;
    self.expressApp = expressApp;
    self.expressApp.use(bodyParser.json());
    self.mountPath = mountPath;
    self.publicAPI = {};

    self.logger.info('Creating mount path at [' + this.mountPath + ']');
    self.expressApp.use('/' + self.mountPath, function(request, response, next) {
        response.message = {
            error : true,
            errorMessage : 'ERROR: API call /' + self.mountPath + '/' + request.path + ' not found.',
            data : {}
        };
        next();
    });
};

functionalAPI.prototype.mountRoute = function configureRoute(file) {
    var self = this;
    var file = self.interpretFile(file);
    if (file && file.properties && file.properties.name && _.isFunction(self.publicAPI[file.properties.name])) {
    	if(!self.expressApp[file.properties.verb])
    		throw "You have specified a verb that Express doesn't like (" + file.properties.verb + ").";

        var route = '/' + self.mountPath + '/' + file.properties.name + '/:method';
        self.logger.info('Mounting route at [' + route + ']');
        self.expressApp[file.properties.verb](route, function(request, response, next) {
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

functionalAPI.prototype.interpretFile = function interpretFile(file) {
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
