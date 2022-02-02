import { PUBSUB_EXCHANGE, SUBSCRIBER } from '../constants';
import logger from '../logger';
import { AmqpClient } from './client';

export interface IAmqpPubsubClient extends AmqpClient {
  publish: (topic: string, data: any) => Promise<void>;
  subscribe: (topic: string, cb: (data: any) => void) => Promise<void>;
  unsubscribe: (topic: string, cb: () => void ) => void;
  subscribeToDurableQueue: (exchange: string, queue: string, cb: () => void) => Promise<void>;
}

export class AmqpPubsubClient extends AmqpClient implements IAmqpPubsubClient {
  publish(topic: string, data: any): Promise<void> {
    logger.info(`AMQP: PUBLISHING TO ${topic}`);

    return this.assertExchange(topic, PUBSUB_EXCHANGE.type)
      .then(() => this.send(topic, PUBSUB_EXCHANGE.routingKey, data, PUBSUB_EXCHANGE.encoding));
  }

  subscribe(topic: string, cb: (data: any) => void): Promise<void> {
    return this.assertExchange(topic, PUBSUB_EXCHANGE.type)
      .then(() => this.assertQueue(SUBSCRIBER.queueName, SUBSCRIBER.queueOptions))
      .then(res => this.assertBinding(res.queue, topic, '').then(() => res))
      .then(res => this.consume(res.queue, cb, SUBSCRIBER.consumeOptions));
  }

  unsubscribe(topic: string): void {
    logger.info(`AMQP: UNSUBSCRIBING FROM ${topic}`);
  }

  subscribeToDurableQueue(exchange: string, queue: string, cb: () => void): Promise<void> {
    return this.assertExchange(exchange, PUBSUB_EXCHANGE.type)
      .then(() => this.assertQueue(queue, SUBSCRIBER.durableQueueOptions))
      .then(() => this.assertBinding(exchange, queue, '', SUBSCRIBER.consumeOptions))
      .then(() => this.consume(queue, cb, SUBSCRIBER.consumeOptions));
  }
}
