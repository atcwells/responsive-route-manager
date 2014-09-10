var expressApp = require('express')();
var fs = require('fs-extra');
var RAM = require('./ResponsiveRouteManager.js');

// var x = new RAM({
	// folder : '/javascript',
	// apiType : 'static',
	// mountPath : 'js'
// }, expressApp);

var ram = new RAM({
	folder : '/functionalAPIExamples',
    clientType : 'functionalAPI',
    mountPath : 'api'
}, expressApp);

expressApp.listen(3000, '127.0.0.1', function() {
    console.log('HTTP server started on 127.0.0.1:3000');
});

setTimeout(function() {
	ram.changeMountPath('api2');
	// ram.shutdown();
}, 100);


