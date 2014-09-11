var expressApp = require('express')();
var fs = require('fs-extra');
var RAM = require('../responsive-route-manager.js');

var x = new RAM({
	folder : '/examples/static-examples',
	clientType : 'static',
	mountPath : 'static'
}, expressApp);

var ram = new RAM({
	folder : '/examples/functional-api-examples',
    clientType : 'functional-api',
    mountPath : 'api'
}, expressApp);

expressApp.listen(3000, '127.0.0.1', function() {
    console.log('HTTP server started on 127.0.0.1:3000');
});

setTimeout(function() {
	console.log(ram.getRoutes());
	ram.changeMountPath('api2');
	// ram.shutdown();
	console.log(x.getRoutes());
}, 100);


