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
var markdown = require('marked');
var highlight = require('highlight.js');
var template = fs.readFileSync(path.join(__dirname, './static/tpl.html'), 'utf8');
var tpl;
var style = fs.readFileSync(path.join(__dirname, './static/style.css'), 'utf8');
var REG_PARENT_PATH = /^\.\.[\/\\]/;
var DEFAULTFILE = 'index.html';

template = template.replace(/{{style}}/, '<style>' + style + '</style>');
tpl = new YdrTemplate(template);
markdown.setOptions({
    highlight: function (code) {
        return highlight.highlightAuto(code).value;
    }
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
        var url = req.url;
        var parse = URL.parse(url);
        var pathname = parse.pathname;
        var search = parse.search || '';
        var lastChar = pathname.slice(-1);
        var basename = path.basename(pathname);
        var extname = path.extname(pathname).toLowerCase();
        var reqFile = path.join(webroot, pathname);
        var relative = path.relative(webroot, reqFile);

        res.setHeader('X-Powered-By', 'sts');

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
                if (['.md', '.markdown'].indexOf(extname) > -1) {
                    var text = fs.readFileSync(reqFile, 'utf8');

                    markdown(text, function (err, body) {
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

    extname = extname || path.extname(file);
    res.setHeader('Last-Modified', lastModified);
    res.setHeader('Content-Type', ydrUtil.mime.get(extname) + '; charset=utf-8');
    res.writeHead(headerModified === lastModified ? 304 : 200);

    if (html) {
        res.end(html);
    } else {
        fs.createReadStream(file).pipe(res);
    }
}
