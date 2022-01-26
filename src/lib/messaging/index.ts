import logger from '../logger';
import PubSub from 'pubsub-js';
import { AMQP_CLIENT_CONNECTED_TOPIC, AMQP_CONNECTED_TOPIC, AMQP_DISCONNECTED_TOPIC } from '../constants';

PubSub.subscribe(AMQP_CONNECTED_TOPIC, () => {
  logger.info('AMQP connection has been established');
});


PubSub.subscribe(AMQP_DISCONNECTED_TOPIC, () => {
  logger.error('AMQP connection has been lost');
});
