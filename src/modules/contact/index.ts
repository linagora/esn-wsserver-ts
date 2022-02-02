
import { Server, Socket } from 'socket.io';
import logger from '../..//lib/logger';
import { init as listen } from './notifications';
import { EVENTS, WS_EVENTS } from './constants';
import { ParsedContact, shouldSkipNotification } from './helper';
import { Logger } from 'winston';
import PubSub from 'pubsub-js';

const NAMESPACE = '/contacts';
let initialized = false;
let contactNamespace: Server;

export default function (io: Server): void {
  contactNamespace = io.of(NAMESPACE);
  
  if (initialized) {
    logger.warn('Contacts namespace already initialized');

    return;
  }

  listen();

  logger.info(`WS: Initializing namespace ${NAMESPACE}`);

  contactNamespace.on('connection', (socket: Socket) => {
    logger.info(`WS: New connection on namespace ${NAMESPACE}`);

    socket.on('subscribe', (bookId: string) => {
      logger.info('WS: Joining contact room', bookId);
      socket.join(bookId);
    });

    socket.on('unsubscribe', (bookId: string) => {
      logger.info('WS: Leaving contact room', bookId);
      socket.leave(bookId);
    });
  });

  PubSub.subscribe(EVENTS.CONTACT_CREATED, handleContactCreation);
  PubSub.subscribe(EVENTS.CONTACT_UPDATED, handleContactUpdate);
  PubSub.subscribe(EVENTS.CONTACT_DELETED, handleContactDelete);

  initialized = true;
}

const synchronizeContactsList = (event: string, data: any): void | Logger => {
  if (shouldSkipNotification(data)) {
    return logger.info(`CONTACTS: skipping notification for contact creation`);
  }

  if (!contactNamespace) {
    return logger.warn('Contacts namespace is not initialized');
  }

  logger.info(`CONTACTS: handling ${event} event`);
  contactNamespace.to(data.bookId).emit(event, { room: data.bookId, data });
}

const handleContactCreation = (_: string, data: ParsedContact): void => {
  synchronizeContactsList(WS_EVENTS.CONTACT_CREATED, data)
}

const handleContactUpdate = (_: string, data: ParsedContact): void => {
  synchronizeContactsList(WS_EVENTS.CONTACT_UPDATED, data)
}

const handleContactDelete = (_: string, data: ParsedContact): void => {
  synchronizeContactsList(WS_EVENTS.CONTACT_DELETED, data)
}
