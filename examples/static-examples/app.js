angular.module('test', []).service('example', ['$http',
function($http) {
  return {
    test: function(parameters) {
      return $http.post('/newapipath/example/test', parameters);
    }
  }
}
]).controller('example1', ['example',
function(example) {
  example.test({
    username: 'xyz'
  }).then(function(data) {
    console.log(data);
  })
}
]);
