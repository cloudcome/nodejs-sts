/**
 * 获取本机局域网 IP 地址
 * @author ydr.me
 * @create 2015-10-29 17:17
 */


'use strict';

var os = require('os');
var dato = require('ydr-utils').dato;

var scopeIP = null;


/**
 * 获取本机局域网 IP 地址
 * @returns {*|string}
 */
module.exports = function () {
    //console.log(os.networkInterfaces());
    dato.each(os.networkInterfaces(), function (networkType, networkList) {
        //{ address: 'fe80::1',
        //netmask: 'ffff:ffff:ffff:ffff::',
        //family: 'IPv6',
        //mac: '00:00:00:00:00:00',
        //scopeid: 1,
        //internal: true }
        dato.each(networkList, function (index, networkMeta) {
            if (networkMeta.family === 'IPv4' && networkMeta.internal === false) {
                scopeIP = networkMeta.address;
                return false;
            }
        });

        if (scopeIP) {
            return false;
        }
    });

    return scopeIP || 'localhost';
};

