declare function require(moduleName: string): unknown;
declare const process: {
    argv: string[];
    cwd(): string;
    env: Record<string, string | undefined>;
};
interface NodePath {
    resolve(...segments: string[]): string;
    extname(filePath: string): string;
}

interface NodeFs {
    existsSync(filePath: string): boolean;
    statSync(filePath: string): {
        isFile(): boolean;
    };
    createReadStream(filePath: string): {
        pipe(destination: unknown): void;
    };
}

interface ServerResponse {
    writeHead(statusCode: number, headers: Record<string, string>): void;
    end(content: string): void;
}

interface IncomingMessage {
    url?: string;
}

interface HttpServer {
    listen(port: number, host: string, callback: () => void): void;
}

interface NodeHttp {
    createServer(callback: (req: IncomingMessage, res: ServerResponse) => void): HttpServer;
}

var http: NodeHttp = require('http') as NodeHttp;
var fs: NodeFs = require('fs') as NodeFs;
var path: NodePath = require('path') as NodePath;

var port: number = Number(process.env.PORT || process.argv[2] || 8091);
var root: string = path.resolve(process.argv[3] || process.cwd());

var contentTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

var server: HttpServer = http.createServer(function (req: IncomingMessage, res: ServerResponse): void {
    var requestUrl: string = req.url || '/';
    var requestPath: string = decodeURIComponent(new URL(requestUrl, 'http://localhost:' + port).pathname);
    var relativePath: string = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    var fullPath: string = path.resolve(root, relativePath);

    if (fullPath.indexOf(root) !== 0 || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
    }

    var extension: string = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { 'Content-Type': contentTypes[extension] || 'application/octet-stream' });
    fs.createReadStream(fullPath).pipe(res);
});

server.listen(port, '127.0.0.1', function (): void {
    console.log('Serving ' + root + ' at http://localhost:' + port + '/');
});
