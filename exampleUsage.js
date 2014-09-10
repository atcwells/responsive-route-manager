var expressApp = require('express')();
var fs = require('fs-extra');
var RAM = require('./ResponsiveRouteManager.js');

// var x = new RAM({
    // folder : '/api',
    // apiType : 'functionalAPI',
    // mountPath : 'api'
// }, expressApp);

// var x = new RAM({
	// folder : '/javascript',
	// apiType : 'static',
	// mountPath : 'js'
// }, expressApp);

expressApp.get('/test', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});

var ram = new RAM({
	folder : '/functionalAPIExamples',
    clientType : 'functionalAPI',
    mountPath : 'api'
}, expressApp);

expressApp.listen(3000, '127.0.0.1', function() {
    console.log('HTTP server started on 127.0.0.1:3000');
});

setTimeout(function() {
	console.log(ram.getRoutes());
	ram.changeMountPath('API');
}, 100);

