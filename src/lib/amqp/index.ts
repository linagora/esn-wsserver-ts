import * as AmpConnManager from 'amqp-connection-manager';
import { AMQP_CONNECTED_TOPIC, AMQP_DISCONNECTED_TOPIC, AMQP_CLIENT_CONNECTED_TOPIC} from '../constants';
import logger from '../logger';
import { AmqpPubsubClient, IAmqpPubsubClient } from './pubsub';

const { AMQP_CONNECTION_STRING } = process.env;
let connectionPromise: Promise<void> = null;
let clientInstancePromise: Promise<IAmqpPubsubClient> = null;
let clientInstancePromiseResolve: (client: IAmqpPubsubClient) => void = null;
let connected = false;

export const createClient = (): Promise<void> => {
  return connect()
    .then(bind)
    .then(onConnection)
    .catch(err => {
      logger.error(`unable to create an AMQP connection`, err);
    })
}

const connect = (): Promise<AmpConnManager.AmqpConnectionManager> => {
  logger.info(`Connecting to AMQP: ${AMQP_CONNECTION_STRING}`);

  return Promise.resolve(AmpConnManager.connect([AMQP_CONNECTION_STRING]));
}

const bind = (connection: AmpConnManager.AmqpConnectionManager): Promise<AmpConnManager.AmqpConnectionManager> => {
  connection.on('connect', () => {
    connected = true;
    logger.info('AMQP: CONNECTED');
    PubSub.publish(AMQP_CONNECTED_TOPIC, connection);
  });

  connection.on('disconnect', err => {
    logger.warn('AMQP: CONNECTION LOST', err);

    if (connected) {
      clientInstancePromise = new Promise(resolve => {
        clientInstancePromiseResolve = resolve;
      });
    }

    connected = false;

    logger.info('AMQP: broadcasting client:disconnected event');
    PubSub.publish(AMQP_DISCONNECTED_TOPIC);
  });

  return Promise.resolve(connection);
}

const onConnection = (connection: AmpConnManager.AmqpConnectionManager): void => {
  connection.createChannel({
    name: "DEFAULT",
    setup: (channel: AmpConnManager.ChannelWrapper) => {
      const client: IAmqpPubsubClient = new AmqpPubsubClient(channel);

      clientInstancePromiseResolve(client);
      logger.info('AMQP: broadcasting client:available event');
      PubSub.publish(AMQP_CLIENT_CONNECTED_TOPIC, client);
    }
  });
}

export const getPubsubClient = (): Promise<IAmqpPubsubClient> => {
  if (!connectionPromise) {
    connectionPromise = createClient();
  }

  if (!clientInstancePromise) {
    clientInstancePromise = new Promise(resolve => {
      clientInstancePromiseResolve = resolve;
    });
  }

  return clientInstancePromise;
}
