/*!
 * index
 * @author ydr.me
 * 2014-09-21 11:05
 */

'use strict';

var ydrUtil = require('ydr-util');
var YdrTemplate = require('ydr-template');
var URL = require('url');
var http = require('http');
var path = require('path');
var fs = require('fs');
var marked = require('marked');
var highlight = require('highlight.js');
var template = fs.readFileSync(path.join(__dirname, './static/tpl.html'), 'utf8');
var tpl;
var style = fs.readFileSync(path.join(__dirname, './static/style.css'), 'utf8');
var REG_PARENT_PATH = /^\.\.[\/\\]/;
var DEFAULTFILE = 'index.html';
//var REG_STREAM = /^(video|audio)\//;

template = template.replace(/\{\{style}}/, '<style>' + style + '</style>');
tpl = new YdrTemplate(template);
marked.setOptions({
    highlight: function (code) {
        return highlight.highlightAuto(code).value;
    },
    sanitize: true
});


/**
 * 启动一个 HTTP 服务器
 * @param webroot {String} 网站根目录
 * @param [port] {String} 端口，默认80
 * @param callback 启动后回调
 */
module.exports = function (webroot, port, callback) {
    if (ydrUtil.typeis(port) === 'function') {
        callback = port;
        port = 80;
    }

    port = ydrUtil.dato.parseInt(port, 80);

    var app = http.createServer(function (req, res) {
        res.setHeader('X-Powered-By', 'sts');
        
        var url = req.url;

        try{
            url = decodeURI(url);
        }catch (err){
            return _errRes(500, req, res);
        }
        
        var parse = URL.parse(url);
        var pathname = parse.pathname;
        var search = parse.search || '';
        var lastChar = pathname.slice(-1);
        var basename = path.basename(pathname);
        var extname = path.extname(pathname).toLowerCase();
        var reqFile = path.join(webroot, pathname);
        var relative = path.relative(webroot, reqFile);

        // 只接受 GET 和 POST 请求
        if (req.method !== 'GET' && req.method !== 'POST') {
            return _errRes(403, req, res);
        }

        // 开头为 ..\ 或者 ../，说明是想访问父级目录，绝对禁止
        if (REG_PARENT_PATH.test(relative)) {
            return _errRes(403, req, res);
        }

        fs.lstat(reqFile, function (err, stats) {
            if (err) {
                return _errRes(404, req, res, err);
            }

            if (stats.isDirectory() || stats.isSymbolicLink()) {
                if (lastChar !== '/') {
                    return _errRes(404, req, res, pathname + '/' + search);
                }

                reqFile = path.join(reqFile, DEFAULTFILE);

                fs.exists(reqFile, function (b) {
                    if (!b) {
                        return _errRes(404, req, res);
                    }

                    _fileRes(reqFile, req, res);
                });
            } else if (stats.isFile()) {
                fs.exists(reqFile, function (b) {
                    if (!b) {
                        return _errRes(404, req, res);
                    }

                    fs.readFile(reqFile, 'utf8', function (err, text) {
                        if (err) {
                            return _errRes(500, req, res);
                        }

                        if (['.md', '.markdown'].indexOf(extname) > -1) {
                            marked(text, function (err, body) {
                                if (err) {
                                    return _errRes(500, req, res, err);
                                }

                                var html = tpl.render({
                                    title: basename,
                                    body: body
                                });

                                _fileRes(reqFile, req, res, '.html', html);
                            });
                        } else {
                            _fileRes(reqFile, req, res);
                        }
                    });
                });
            } else {
                _errRes(500, req, res);
            }
        });
    });

    app.listen(port, callback);
    app.on('error', callback);
};


/**
 * 错误响应
 * @param code
 * @param res
 * @param [err]
 * @private
 */
function _errRes(code, req, res, err) {
    var msg = ydrUtil.httpStatus.get(code);

    res.writeHead(code, {
        'content-type': ydrUtil.mime.get('.html') + '; charset=utf-8'
    });

    if (code === 301 || code === 302) {
        res.setHeader('location', err);
    } else {
        res.write(tpl.render({
            title: msg,
            body: err ? err.message : msg
        }));
    }

    res.end();
}


/**
 * 文件响应
 * @param file
 * @param res
 * @private
 */
function _fileRes(file, req, res, extname, html) {
    var lastModified = ydrUtil.crypto.lastModified(file);
    var headerModified = req.headers['if-modified-since'];
    var range;
    var positions;
    var start;

    extname = extname || path.extname(file);
    var contentType = ydrUtil.mime.get(extname);
    res.setHeader('Last-Modified', lastModified);
    res.setHeader('Content-Type', contentType + '; charset=utf-8');
    res.statusCode = headerModified === lastModified ? 304 : 200;

    // stream
    if (req.headers.range) {
        range = req.headers.range;
        positions = range.replace(/bytes=/, '').split('-');
        start = ydrUtil.dato.parseInt(positions[0], 10);

        fs.stat(file, function (err, stats) {
            var total = stats.size;
            var end = positions[1] ? ydrUtil.dato.parseInt(positions[1], 10) : total - 1;
            var chunksize = (end - start) + 1;

            res.statusCode = 206;
            res.setHeader('content-range', 'bytes ' + start + "-" + end + "/" + total);
            res.setHeader('accept-ranges', 'bytes');
            res.setHeader('content-length', chunksize);
            res.setHeader('content-type', contentType);

            var stream = fs.createReadStream(file, {start: start, end: end})
                .on('open', function () {
                    stream.pipe(res);
                }).on('error', function (err) {
                    res.end(err);
                });
        });
    } else if (html) {
        res.end(html);
    } else {
        fs.createReadStream(file).pipe(res);
    }
}
