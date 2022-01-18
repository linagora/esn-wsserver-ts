
import { Server, Socket } from 'socket.io';
import logger from '@server/lib/logger';

const NAMESPACE = '/contacts';
let initialized = false;
let contactNamespace: Server;

export default function (io: Server): void {
  contactNamespace = io.of(NAMESPACE);

  if (initialized) {
    logger.warn('Contacts namespace already initialized');

    return;
  }

  logger.info(`Initializing namespace ${NAMESPACE}`);

  contactNamespace.on('connection', (socket: Socket) => {
    logger.info(`New connection on namespace ${NAMESPACE}`);

    socket.on('subscribe', (bookId: string) => {
      logger.info('Joining contact room', bookId);
      socket.join(bookId);
    });

    socket.on('unsubscribe', (bookId: string) => {
      logger.info('Leaving contact room', bookId);
      socket.leave(bookId);
    });
  });

  initialized = true;
}

const synchronizeContactsList = (event: any, data: any): void => {
  contactNamespace && contactNamespace
    .to(data.bookId)
    .emit(event, {
      room: data.bookId,
      data
    });
}

export const onContactDelete = (data: any): void => {
  if (data && data.bookId && data.contactId) {
    const { bookId, bookName, contactId } = data;

    synchronizeContactsList('contact:deleted', {
      bookId,
      bookName,
      contactId
    })
  } else {
    logger.warn('onContactDelete: missing data');
  }
}
