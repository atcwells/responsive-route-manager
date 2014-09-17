var expressApp = require('express')();
var _ = require('lodash-node');
var RRM = require('../responsive-route-manager.js');

describe("Require Express", function() {
  
});

describe("API structure", function() {
  var rrmFunctional = new RRM({
    folder : '/examples/functional-api-examples',
    clientType : 'functional-api',
    mountPath : 'api',
    logger: ''
  }, expressApp);

  it("should contain the startup method", function() {
    expect(_.isFunction(rrmFunctional.startup)).toBe(true);
  });
});
