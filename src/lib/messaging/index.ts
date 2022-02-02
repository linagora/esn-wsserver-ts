import logger from '../logger';
import PubSub from 'pubsub-js';
import { AMQP_CONNECTED_TOPIC, AMQP_DISCONNECTED_TOPIC, AMQP_CLIENT_CONNECTED_TOPIC } from '../constants';
import { MessagingManger } from './manager';
import { IAmqpPubsubClient } from '../amqp/pubsub';

const manager = new MessagingManger();

PubSub.subscribe(AMQP_CONNECTED_TOPIC, () => {
  logger.info('AMQP: connection has been established');
});


PubSub.subscribe(AMQP_DISCONNECTED_TOPIC, () => {
  logger.error('AMQP: connection has been lost');

  manager.unsetClient();
});

PubSub.subscribe(AMQP_CLIENT_CONNECTED_TOPIC, (_, client: IAmqpPubsubClient) => {
  logger.info('AMQP: client has been connected');

  manager.setClient(client);
});

export default manager;
