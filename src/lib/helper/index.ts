import { IncomingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { Socket } from 'socket.io';
import * as store from '../store';

export type socketInfo = {
  userId?: string,
  query: ParsedUrlQuery,
  headers: IncomingHttpHeaders,
  remoteAddress: string,
  remotePort: number,
}

export const getSocketInfo = (socket: Socket): socketInfo | null => {
  if (!socket || !socket.request) {
    return null;
  }
  
  const { request } = socket;
  let remoteAddress: string, remotePort: number;


  if (request.socket) {
    remoteAddress = request.socket.remoteAddress;
    remotePort = request.socket.remotePort;
  }

  return {
    userId: socket.request?.userId,
    query: socket.handshake.query,
    headers: request.headers,
    remoteAddress,
    remotePort,
  }
}

export const setUserId = (socket: Socket, userId: string): void => {
  socket.request.userId = userId;
}

export const getUserId = (socket: Socket): string | null => {
  return socket.request?.userId;
}

export const getUserSocketsFromNamespace = (userId: string, namespaceSockets: Socket[]): Socket[] => {
  const userSockets = store.getSocketsForUser(userId);
  const namespaceSocketIds = {};

  Object.values(namespaceSockets).forEach(socket => {
    namespaceSocketIds[socket.id] = socket;
  });

  return userSockets
    .filter(({ id }) => id in namespaceSocketIds)
    .map(({ id }) => namespaceSocketIds[id]);
}
