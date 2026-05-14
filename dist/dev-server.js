"use strict";
var http = require('http');
var fs = require('fs');
var path = require('path');
var port = Number(process.env.PORT || process.argv[2] || 8091);
var root = path.resolve(process.argv[3] || process.cwd());
var contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};
var server = http.createServer(function (req, res) {
    var requestUrl = req.url || '/';
    var requestPath = decodeURIComponent(new URL(requestUrl, 'http://localhost:' + port).pathname);
    var relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    var fullPath = path.resolve(root, relativePath);
    if (fullPath.indexOf(root) !== 0 || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
    }
    var extension = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { 'Content-Type': contentTypes[extension] || 'application/octet-stream' });
    fs.createReadStream(fullPath).pipe(res);
});
server.listen(port, '127.0.0.1', function () {
    console.log('Serving ' + root + ' at http://localhost:' + port + '/');
});
