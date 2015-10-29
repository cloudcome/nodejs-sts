/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-22 13:55
 */


'use strict';

var dato = require('ydr-utils').dato;
var path = require('path');
var open = require('open');
var os = require('os');

var pkg = require('./package.json');

var scopeIP = null;
var REG_SCOPE = /^192\.168\./;

dato.each(os.networkInterfaces(), function (networkType, networkList) {
    //{ address: 'fe80::1',
    //netmask: 'ffff:ffff:ffff:ffff::',
    //family: 'IPv6',
    //mac: '00:00:00:00:00:00',
    //scopeid: 1,
    //internal: true }
    dato.each(networkList, function (index, networkMeta) {
        if (networkMeta.family === 'IPv4' && REG_SCOPE.test(networkMeta.address)) {
            scopeIP = networkMeta.address;
            return false;
        }
    });

    if (scopeIP) {
        return false;
    }
});

scopeIP = scopeIP || 'localhost';

return console.log(scopeIP);


///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//////////////////////////【配置】/////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
var WEBROOT = process.cwd();
var args = process.argv.slice(2);


if (args[0] && args[0].toLowerCase() === '-v') {
    console.log('############################################################');
    console.log('STATIC TRUSTED SERVER => sts');
    console.log('sts version = ' + pkg.version);
    console.log('############################################################');
    process.exit(-1);
} else if (args.length < 1) {
    console.log('############################################################');
    console.log('STATIC TRUSTED SERVER => sts');
    console.log('Please set static server PORT, like 18080!');
    console.log('Use `sts 18080 my static server` to start!');
    console.log('############################################################');
    process.exit(-1);
}

var PORT = args.shift();


if (!/^\d+$/.test(PORT)) {
    console.log('############################################################');
    console.log('STATIC TRUSTED SERVER => sts');
    console.log('The static server PORT must be a number, like 18080!');
    console.log('Use `sts 18080 my static server` to start!');
    console.log('############################################################');
    process.exit(-1);
}


var NAME = args.join(' ') || path.basename(WEBROOT);
var server = require('./index.js');

server(WEBROOT, PORT, function (err) {
    if (err) {
        console.log('############################################################');
        console.log('STATIC TRUSTED SERVER => sts');
        console.log(NAME + ' ERROR:');
        console.log(err.stack || 'unknow stack');
        console.log('############################################################');
        console.log();
        process.exit(-1);
    } else {
        console.log('############################################################');
        console.log('STATIC TRUSTED SERVER => sts');
        console.log(NAME + ' URL: http://localhost:' + PORT);
        console.log('WEBROOT: ' + WEBROOT);
        console.log('############################################################');
        console.log();

        // open url in default browser
        open('http://' + scopeIP + ':' + PORT);
    }
});
