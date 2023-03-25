console.log("Starting SFTROU server...")

import WebSocket from 'ws';
import http from 'http';
import fs from 'fs';
import url from 'url'
import path from 'path'

import responder from './responder'

const server = http.createServer({
    // cert: fs.readFileSync("/etc/letsencrypt/live/sftrou.omarelamri.me/fullchain.pem"),
    // key: fs.readFileSync("/etc/letsencrypt/live/sftrou.omarelamri.me/privkey.pem")
}, function (req, res) {
    console.log(`${req.method} ${req.url}`);
  
    // parse URL
    const parsedUrl = url.parse(req.url ? req.url as string : "");
    // extract URL path
    let pathname = `./website${parsedUrl.pathname}`;
    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
    const ext = path.parse(pathname).ext;
    // maps file extention to MIME typere
    const map: {[key: string]: string} = {
      '.ico': 'image/x-icon',
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword'
    };
  
    fs.exists(pathname, function (exist) {
      if(!exist) {
        // if the file is not found, return 404
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
      }
  
      // if is a directory search for index file matching the extention
      if (fs.statSync(pathname).isDirectory()) pathname += '/index.html';
  
      // read file from file system
      fs.readFile(pathname, function(err, data){
        if(err){
          res.statusCode = 500;
          res.end(`Error getting the file: ${err}.`);
        } else {
          // if the file is found, set Content-type and send data
          res.setHeader('Content-type', map[ext] || 'text/html' );
          res.end(data);
        }
      });
    });
})

const wss = new WebSocket.Server({server})

wss.on('connection', function connection(ws) {
    (ws as any).isAlive = true;
    ws.on('pong', () => {(this as any).isAlive = true});

    ws.on('message', function incoming(message) {

        const json = JSON.parse((message as string))

        responder(json, ws);
    })
});

// Alive listener
const interval = setInterval(function ping() {
wss.clients.forEach(function each(ws) {
    if ((ws as any).isAlive === false) return ws.terminate();

    (ws as any).isAlive = false;
    ws.ping(() => {(ws as any).isAlive = true;});
});
}, 30000);

server.listen(8080)
console.log("Listening on port 8080...")
