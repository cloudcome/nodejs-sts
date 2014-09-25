/*!
 * index
 * @author ydr.me
 * 2014-09-21 11:05
 */

'use strict';


var url2 = require('url');
var http = require('http');
var path = require('path');
var fs = require('fs');
var lib = require('./lib.js');
var markdown = require('marked');
var highlight = require('highlight.js');
var template = fs.readFileSync(path.join(__dirname, './static/tpl.html'), 'utf8');
var style = fs.readFileSync(path.join(__dirname, './static/style.css'), 'utf8')
    .replace(/\s+/g, ' ')
    .replace(/[\n\r\t]/g, '')
    .replace(/\/\*[\s\S]*?\*\//,'');
template = template.replace(/{{style}}/, '<style>' + style + '</style>');
var regBody = /{{body}}/;
var regTitle = /{{title}}/;
var regParentPath = /^\.\.[\/\\]/;
var DEFAULTFILE = 'index.html';
markdown.setOptions({
    highlight: function (code) {
        return highlight.highlightAuto(code).value;
    }
});


module.exports = function (webroot, port, callback) {
    port = port * 1;
    http.createServer(function (request, response) {
        var url = request.url;
        var parse = url2.parse(url);
        var pathname = parse.pathname;
        var search = parse.search || '';
        var lastChar = pathname.slice(-1);
        var basename = path.basename(pathname);
        var extname = path.extname(pathname).toLowerCase();
        var filepath = path.join(webroot, pathname);
        var relative = path.relative(webroot, filepath);
        var d = new Date();

        lib.log('TIME <=', d.getFullYear() + '-' +
            lib.fixNumber(d.getMonth() + 1) + '-' +
            lib.fixNumber(d.getDate()) + ' ' +
            lib.fixNumber(d.getHours()) + ':' +
            lib.fixNumber(d.getMinutes()) + ':' +
            lib.fixNumber(d.getSeconds()));
        lib.log('UA <=', request.headers['user-agent']);
        lib.log(request.method + ' <=', 'http://localhost' + (port === 80 ? '' : ':' + port) + url);
        lib.log('PARSE =>', filepath);
        console.log();

        // 只接受 GET 和 POST 请求
        if (request.method !== 'GET' && request.method !== 'POST') {
            return lib['403'](response, 'Forbidden');
        }

        // 开头为 ..\ 或者 ../，说明是想访问父级目录，绝对禁止
        if (regParentPath.test(relative)) {
            return lib['403'](response, 'Forbidden');
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
                        'content-type': lib.getMime('.html') + '; charset=utf-8'
                    });
                    fs.createReadStream(filepath).pipe(response);
                });
            } else if (stats.isFile()) {
                response.writeHead(200, {
                    'content-type': lib.getMime(extname) + '; charset=utf-8'
                });
                if (['.md', '.markdown'].indexOf(extname) > -1) {
                    var text = fs.readFileSync(filepath, 'utf8');
                    markdown(text, function (err, html) {
                        if (err) {
                            return lib['500'](response, err.message);
                        }

                        response.end(template.replace(regBody, html).replace(regTitle, basename));
                    });
                } else {
                    fs.createReadStream(filepath).pipe(response);
                }
            } else {
                lib['500'](response);
            }
        });
    }).listen(port, callback).on('error', callback);
};





