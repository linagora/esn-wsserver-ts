import express from 'express';
import http from 'http';
import Server, { Socket } from "socket.io";
import jwtAuthHandler from './auth/jwt';
import cors from 'cors';
import { getUserId } from './lib/helper';
import { registerSocket, unregisterSocket } from './lib/store';
import * as dotenv from 'dotenv';
import contacts from './modules/contacts';
import logger from './lib/logger';

dotenv.config();

const app: express.Application = express();
app.use(cors({ origin: '*' }));

const httpServer: http.Server = http.createServer(app);
const sio: Server = new Server(httpServer,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  serveClient: true
});

if (sio) {
  sio.use(jwtAuthHandler);
  
  sio.on('connection', (socket: Socket) => {    
    const user = getUserId(socket);

    registerSocket(socket);

    if (user) {
      logger.info(`New connection from ${user}`);
    }

    socket.on('disconnect', () => {
      logger.info(`Disconnect from ${user}`);
      unregisterSocket(socket);
    });
  });

  contacts(sio);
}

httpServer.listen(3000);
