var express = require('express')();

var RAM = require('./responsive-route-manager.js');
var api_manager = new RAM({
  folder : '/examples/functional-api-examples/',
  clientType : 'functional-api',
  mountPath : 'api'
  // logger : self._log
}, express, function() {
  console.log('setup!!')
  express.listen(3000, '127.0.0.1', function() {
    console.log('HTTP server started on 127.0.0.1:3000');
    console.log(express._router.stack);
    api_manager.changeMountPath('newapipath', function() {
      console.log('route changed');
      api_manager.getRoutes(function(err, routes) {
        console.log(err);
        console.log(routes);
      });
    });
  });

});
