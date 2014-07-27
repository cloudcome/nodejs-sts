'use strict';



///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//////////////////////////【配置】/////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
var WEBROOT = __dirname;
var DEFAULTFILE = 'index.html';
var args = process.argv.slice(2);
var PORT = args.shift();
var NAME = args.join(' ') || 'static server';





///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//////////////////////////【实现】/////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
var url2 = require('url');
var http = require('http');
var path = require('path');
var fs = require('fs');
var lib = require('./lib.js');
var reg = /^\./;

http.createServer(function(request, response) {
    var url = request.url;
    var parse = url2.parse(url);
    var pathname = parse.pathname;
    var search = parse.search || '';
    var lastChar = pathname.slice(-1);
    var extname = path.extname(pathname).toLowerCase();
    var filepath = path.join(WEBROOT, pathname);
    var relative = path.relative(WEBROOT, filepath);

    // 开头打点了，说明是想访问父级目录，绝对禁止
    if (reg.test(relative)) return lib['500'](response, '非法操作');

    fs.lstat(filepath, function(e, stats) {
        if (e) {
            lib['404'](response);
        } else if (stats.isDirectory() || stats.isSymbolicLink()) {

            if (lastChar !== '/') return lib['302'](response, pathname + '/' + search);

            filepath = path.join(filepath, DEFAULTFILE);

            fs.exists(filepath, function(b) {
                if (!b) return lib['404'](response);

                response.writeHead(200, {
                    'content-type': lib.getMime('.html')
                });
                fs.createReadStream(filepath).pipe(response);
            });
        } else if (stats.isFile()) {
            response.writeHead(200, {
                'content-type': lib.getMime(extname)
            });
            fs.createReadStream(filepath).pipe(response);
        } else {
            lib['500'](response);
        }
    });
}).listen(PORT, function() {
    console.log('');
    console.log('############################################################');
    console.log(NAME + ' URL: http://localhost:' + PORT);
    console.log('############################################################');
    console.log('');
}).on('error', function(e) {
    console.log('');
    console.log('############################################################');
    console.log(NAME + ' ERROR:');
    console.log(e.stack);
    console.log('############################################################');
    console.log('');
});