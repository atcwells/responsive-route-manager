# responsive-route-manager

Route manager which updates according to watched files. Configurable programmatically. Requires [express](https://github.com/strongloop/express) to be passed, in order to actually configure any routes.

## Installation

Install from npm:

    npm install --save responsive-route-manager

## Example

1.) run 'npm install--save responsive-route-manager'.

2.) run 'npm install--save express'.

3.) create a file in the root of your new project with the following script:

    var expressApp = require('express')();
    var RRM = require('responsive-route-manager');
    var rrmFunctional = new RRM({
        folder : '/node_modules/responsive-route-manager/examples/functional-api-examples',
        clientType : 'functional-api',
        mountPath : 'api',
        logger: ''
    }, expressApp);

    var rrmStatic = new RRM({
      folder : '/node_modules/responsive-route-manager/examples/static-examples',
        clientType : 'static',
        mountPath : 'static'
    }, expressApp);

    expressApp.listen(3000, '127.0.0.1', function() {
        console.log('HTTP server started on 127.0.0.1:3000');
    });

    setTimeout(function(){
          rrmFunctional.changeMountPath('newapipath');
    }, 100);


4.) run the file using:

```
node <filename>
```

5.) POST a request to the functional-api, or a GET to the static file manager.

5a.) Use curl from the command line like the following:

```
curl -H "Content-Type: application/json" -d '{"username":"xyz","password":"xyz"}' http://127.0.0.1:3000/api/example/test
```

This will not work! try swapping `api` for `newapipath` to see results.

5b.) Use a browser to visit your webserver at http://127.0.0.1:3000/static/home. You'll see a blank page, the page has submitted a request to the API.

If using the functional-api routes, you can now change your routes and you'll immediately (without restarting) be able to reach your new functionality.


If using the static routes, you can add/remove/rename the files and change the contents, and the new file will be served as per the request.

## Options

  - `logger` A logger object which exposes methods 'info', 'error', 'warn', 'debug'. Otherwise messages are logged to the console.
  - `folder (optional)` Folder which should be inspected for the lifetime of the application for changes/insertions.
  - `mountPath` URL Path upon which the assets should be mounted.
  - `clientType` Corresponds to the filename of one of the files in the 'client_types' folder. Defines the type of asset to be managed.

## Client Types

Current client types are:

  - `functional-api` An API which takes in POST parameters and responds using logic defined by a piece of middleware.
  - `static` A server which responds to new files creating new routes as they are required. A replacement for statically passing a whole folder.

## Designing a new Client Type

A client type can do pretty much anything you like, as long as it implements two methods:

constructor: here any catch-all routes can be applied.
configureRoute: a function which decides how a route is executed for this client type.
interpretFile: a handler function which will decide how a file is to be recognised.

## API

###startup()
called automatically when package is initialized
###shutdown()
programmatically shutdown the RouteManager
###changeMountPath(path)
change the path on which the Routes are configured
###discoverFiles()
find the files in the folder in which the RouteManager is looking
###setupFileWatching()
configure the watchers which will notify the Route when changes are made
###getRoutes()
return a map of all the routes configured for this RouteManager

## License

(The MIT License)

Copyright (c) 2014 Alex Wells &lt;atcwells@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
