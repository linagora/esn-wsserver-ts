import { Socket } from 'socket.io';
import { getUserId } from '../helper';
import logger from '../logger';

type socketStore = Record<string, Socket[]>;

const websockets: socketStore = {};

export const registerSocket = (socket: Socket):void => {
  const userId = getUserId(socket);

  if (!userId || !userId.length) {
    logger.error('failed to register socket, missing user id');

    throw new Error('Cannot register a socket without an associated userId');
  }

  websockets[userId] = websockets[userId] || [];
  websockets[userId].push(socket);
}

export const unregisterSocket = (socket: Socket):void => {
  const userId = getUserId(socket);

  if (!(userId in websockets)) {
    return;
  }

  websockets[userId] = websockets[userId].filter(({ id }) => id !== socket.id);
}

export const getSocketsForUser = (userId: string):Socket[] => {
  return websockets[userId] || [];
}

export const clean = ():void => {
  Object.keys(websockets).forEach(userId => {
    websockets[userId].forEach(socket => {
      socket.disconnect(true);
      unregisterSocket(socket);
    });
  });
}
