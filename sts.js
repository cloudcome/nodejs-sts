'use strict';

var url2 = require('url');
var http = require('http');
var path = require('path');
var fs = require('fs');
var lib = require('./lib.js');
var markdown = require('markdown-parse');
var template = fs.readFileSync('./markdown-template.html', 'utf8');
var regTemplate = /{{markdown}}/;


///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//////////////////////////【配置】/////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
var WEBROOT = process.cwd();
var DEFAULTFILE = 'index.html';
var args = process.argv.slice(2);

if (args.length < 1) {
    console.log('############################################################');
    console.log('Please set static server PORT, like 18080!');
    console.log('Use `sts 18080 my static server` to start!');
    console.log('############################################################');
    return;
}

var PORT = args.shift();

if (!/^\d+$/.test(PORT)) {
    console.log('############################################################');
    console.log('The static server PORT must be a number, like 18080!');
    console.log('Use `sts 18080 my static server` to start!');
    console.log('############################################################');
    return;
}

var NAME = args.join(' ') || path.basename(WEBROOT);


///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
//////////////////////////【实现】/////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
var reg = /^\./;

http.createServer(function (request, response) {
    var url = request.url;
    var parse = url2.parse(url);
    var pathname = parse.pathname;
    var search = parse.search || '';
    var lastChar = pathname.slice(-1);
    var extname = path.extname(pathname).toLowerCase();
    var filepath = path.join(WEBROOT, pathname);
    var relative = path.relative(WEBROOT, filepath);

    // 开头打点了，说明是想访问父级目录，绝对禁止
    if (reg.test(relative)) {
        return lib['500'](response, '非法操作');
    }

    fs.lstat(filepath, function (err, stats) {
        if (err) {
            return lib['404'](response);
        }

        if (stats.isDirectory() || stats.isSymbolicLink()) {

            if (lastChar !== '/') {
                return lib['302'](response, pathname + '/' + search);
            }

            filepath = path.join(filepath, DEFAULTFILE);

            fs.exists(filepath, function (b) {
                if (!b) {
                    return lib['404'](response);
                }

                response.writeHead(200, {
                    'content-type': lib.getMime('.html')
                });
                fs.createReadStream(filepath).pipe(response);
            });
        } else if (stats.isFile()) {
            response.writeHead(200, {
                'content-type': lib.getMime(extname)
            });
            if (['.md', '.markdown'].indexOf(extname) > -1) {
                var text = fs.readFileSync(filepath, 'utf8');
                var html = markdown(text, function (err, ret) {
                    if (err) {
                        return lib['500'](response, err.message);
                    }

                    response.end(template.replace(regTemplate, ret.html));
                });
            } else {
                fs.createReadStream(filepath).pipe(response);
            }
        } else {
            lib['500'](response);
        }
    });
}).listen(PORT, function () {
    console.log('############################################################');
    console.log(NAME + ' URL: http://localhost:' + PORT);
    console.log('############################################################');
}).on('error', function (e) {
    console.log('############################################################');
    console.log(NAME + ' ERROR:');
    console.log(e.stack);
    console.log('############################################################');
});