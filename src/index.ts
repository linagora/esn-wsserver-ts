import express from 'express';
import * as http from 'http';
import * as ws from 'ws';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const wss: ws.Server = new ws.Server({ server });

wss.on('connection', (ws: ws) => {
  ws.on('message', (message: string) => {
    console.log(message);
  });
});

server.listen(process.env.WS_PORT || 8080, () => {
  console.log('Server listening on port 8080');
});
