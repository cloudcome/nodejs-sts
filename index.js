/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-22 13:55
 */


'use strict';

var command = require('ydr-utils').command;
var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;
var npm = require('ydr-utils').npm;
var path = require('path');
var open = require('open');

var getScopeIP = require('./libs/get-scope-ip.js');
//var staticServer = require('./libs/static-server.js');
var pkg = require('./package.json');

var scopeIP = getScopeIP();

// command config
command.alias({
    v: 'version',
    V: 'version',
    h: 'help',
    H: 'help'
});

command.if('version', function () {
    debug.success('local version', pkg.version);
    npm.getLatestVersion(pkg.name, function (err, version) {
        if (err) {
            return debug.error('error', err.message);
        }

        debug.success('online version', version);
    });
});


module.exports = function (webroot, port) {

};


//
//var http = require('http');
//var server  = http.createServer()
//server.listen(0)
//server.on('listening', function() {
//    var port = server.address().port
//
//    console.log(port);
//})