// 库文件


'use strict';

var mimeJSON = require('./mime.json');

module.exports = {
    // mime
    getMime: function (extname) {
        return mimeJSON[extname] || 'application/octect-stream';
    },

    // 404
    '404': function (response, html) {
        response.writeHead(404, {
            'content-type': mimeJSON['.html'] + '; charset=utf-8'
        });
        response.end(html || '<h1>404 Not Found</h1>');
    },

    // 500
    '500': function (response, html) {
        response.writeHead(500, {
            'content-type': mimeJSON['.html'] + '; charset=utf-8'
        });
        response.end(html || '<h1>500 Internal Server Error</h1>');
    },

    // 302
    '302': function (response, to) {
        response.writeHead(302, {
            'location': to || '/'
        });
        response.end();
    },

    log: function log(event, message) {
        while (9 - event.length > 0) {
            event = ' ' + event;
        }
        console.log(event + ' ' + message);
    }
};