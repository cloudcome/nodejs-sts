// 库文件


'use strict';

var mimeJSON = require('./mime.json');

module.exports = {
    // mime
    getMime: function(extname) {
        return mimeJSON[extname] || 'application/octect-stream';
    },

    // 404
    '404': function(response, html) {
        response.writeHead(404, {
            'content-type': mimeJSON['.html']
        });
        response.end(html || '<h1>404</h1>');
    },

    // 500
    '500': function(response, html) {
        response.writeHead(500, {
            'content-type': mimeJSON['.html']
        });
        response.end(html || '<h1>500</h1>');
    },

    // 302
    '302': function(response, to) {
        response.writeHead(302, {
            'location': to || '/'
        });
        response.end();
    },
};