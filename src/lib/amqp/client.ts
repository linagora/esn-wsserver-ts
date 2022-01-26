import { ChannelWrapper,  } from 'amqp-connection-manager';
import { Replies } from 'amqplib';
import logger from '../logger';

export interface IAmqpClient {
  channel: ChannelWrapper;
  dispose: () => Promise<void>;
  assertExchange: (exchange: string, type: string, options?: any) => void;
  assertQueue: (queue: string, options?: any) => void;
  ack: (message: any, all: boolean) => void;
  assertBinding: (queue: string, exchange: string, pattern: string, options?: any) => Promise<void>;
  send: (exchange: string, routingKey: string, content: any, options?: any) => void;
  consume: (queue: string, onMessage: (message: any) => void, options?: any) => Promise<void>;
}

export class AmqpClient implements IAmqpClient {
  channel: ChannelWrapper;

  constructor(channel: ChannelWrapper) {
    this.channel = channel;
  }

  dispose(): Promise<void> {
    logger.info('AMQP: CLOSING CONNECTION');

    return this.channel.close();
  }

  assertExchange(exchange: string, type: string, options?: any): Promise<Replies.AssertExchange> {
    return this.channel.assertExchange(exchange, type, options);
  }

  assertQueue(queue: string, options?: any): Promise<Replies.AssertQueue> {
    return this.channel.assertQueue(queue, options);
  }

  ack(message: any, all: boolean): void {
    return this.channel.ack(message, all);
  }

  assertBinding(queue: string, exchange: string, pattern: string, options?: any): Promise<void> {
    return this.channel.bindQueue(queue, exchange, pattern, options);
  }

  send(exchange: string, routingKey: string, content: any, options?: any): void {
    this.channel.publish(exchange, routingKey, content, options);
  }

  consume(queue: string, cb: (message: any) => void, options?: any): Promise<void> {
    const onMessage = (message): void | Promise<void> => {
      const res: any | null = cb(message.content);

      if (res instanceof Promise) {
        return res.then(() => { this.ack(message, false); });
      }

      return this.ack(message, false);
    };

    return this.channel.consume(queue, onMessage, options);
  }
}
