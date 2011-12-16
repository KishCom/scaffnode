/*
*   Scaffnode:
*   Super light Express Setup
*
*   Andrew Kish, Dec 2011
*   Neat trick: uncomment every commented-out line for SSL 
*   support (you'll need a key and cert, you can gen your 
*   own by following steps 1-4 here: http://kish.cm/dzzk3z )
*/

var express = require('express');
//var https = require('https');
//var fs = require('fs');

var site = express.createServer(); //Comment me out if you are enabling SSL

//var opts = { key: fs.readFileSync('server.key'), cert: fs.readFileSync('server.crt')};
//var site = express.createServer(opts);

site.get('/', function(req, res){

    res.send("Just some content that you want displayed \n");

});

site.listen(8080);
console.log("Express listening on port %d", site.address().port, site.settings.env);