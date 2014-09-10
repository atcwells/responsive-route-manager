# ResponsiveRouteManager

## Installation

## Options

  - `logger` Collection (optional, default: `sessions`) 
  - `folder` Collection (optional, default: `sessions`) 
  - `mountPath` Collection (optional, default: `sessions`) 
  - `clientType` Coresponds to the filename of one of the files in the 'client_types' folder. Defines the type of 
  
Route manager which updates according to watched files. Configurable programmatically

## Example

    var expressApp = require('express')();
    var RAM = require('./ResponsiveRouteManager.js');
    var ram = new RAM({
        folder : '/api',
        apiType : 'functionalAPI',
        mountPath : 'api'
    }, expressApp);

    ram.changeMountPath('newapipath');

##API

###startup()
called automatically when package is initialised
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