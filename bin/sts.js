#!/usr/bin/env node

'use strict';

var path = require('path');
var pkg = require('../package.json');


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
var server = require('../index.js');

server(WEBROOT, PORT, function (err) {
    if(err){
        console.log('############################################################');
        console.log('STATIC TRUSTED SERVER => sts');
        console.log(NAME + ' ERROR:');
        console.log(err.stack || 'unknow stack');
        console.log('############################################################');
        console.log();
        process.exit(-1);
    }else{
        console.log('############################################################');
        console.log('STATIC TRUSTED SERVER => sts');
        console.log(NAME + ' URL: http://localhost:' + PORT);
        console.log('WEBROOT: ' + WEBROOT);
        console.log('############################################################');
        console.log();
    }
});
