import { getPubsubClient } from '../amqp';
import { IAmqpPubsubClient } from '../amqp/pubsub';
import logger from '../logger';

export type Channel = {
  send: (message: any) => void;
  receive: (receiver: any) => void;
  unsubscribe: (handler: any) => void;
}
export interface IMessagingManager {
  get: (key: string) => any;
  setClient: (client: IAmqpPubsubClient) => void;
  unsetClient: (cb: () => void) => void;
  client: IAmqpPubsubClient;
  init: () => void;
}
export class MessagingManger implements IMessagingManager {
  client: IAmqpPubsubClient;
  _channels: { [key: string]: any };
  _sendBuffer: any[];
  _receiveCache: any[];
  _receiveBuffer: any[];

  constructor(client?: IAmqpPubsubClient) {
    this.client = client;
    this._channels = {};
    this._sendBuffer = [];
    this._receiveCache = [];
    this._receiveBuffer = [];
  }

  init(): void {
    getPubsubClient()
      .catch(err => {
        logger.error(`MessagingManager: error creating client`, err);
      });
  }

  get(key: string): Channel {
    logger.debug(`MessagingManager: get channel for ${key}`);

    if (!this._channels[key]) {
      this._channels[key] = this._createChannel(key);
    }

    return this._channels[key];
  }

  setClient(client: IAmqpPubsubClient): Promise<void> {
    if (!client) {
      return Promise.reject(new Error('MessagingManager: client is not defined'));
    }

    if (this.client) {
      logger.warn('MessagingManager: client is already set, overriding');
    }

    this.client = client;

    return this._bindCachedReceivers()
      .then(() => this._sendBufferedMessages())
      .then(() => {
        this._receiveBuffer.forEach(cb => cb());
        this._receiveBuffer = [];
        this._sendBuffer = [];
      })
      .catch(err => {
        logger.error(`MessagingManager: error creating receivers`, err)
      });
  }

  unsetClient(cb?: ()=> void): void {
    const oldClient: IAmqpPubsubClient = this.client;

    this.client = null;

    try {
      oldClient.dispose();
      cb();
    } catch (err) {
      logger.error(`MessagingManager: error disposing client`, err);
    }
  }

  _createChannel(key: string): Channel {
    return {
      send: (message: any) => {
        if (!this.client) {
          this._sendBuffer.push({ key, message });
          return;
        }

        this.client.publish(key, message);
      },
      receive: (receiver: any): Promise<void> => {
        const wrapper = this._wrapReceiver(key, receiver);

        this._addReceiverToCache(key, wrapper);

        if (!this.client) {
          return new Promise(resolve => {
            this._receiveBuffer.push(() => resolve(wrapper));
          })
        }

        return this._bindReceiver(key, wrapper)
          .then(() => wrapper);
      },
      unsubscribe: (handler: any) => {
        this._removeReceiverFromCache(key, handler);

        if (this.client) {
          logger.debug(`MessagingManager: unbind receiver for channel ${key}`);

          return this.client.unsubscribe(key, handler);
        }
      }
    }
  }

  _addMessageToBuffer(channel: Channel, message: any): void {
    this._sendBuffer.push({ channel, message });
  }

  _wrapReceiver = (channel: string, receiver: any): any => {
    return (jsonMessage: any,message: any): void => {
      logger.debug(`MessagingManager: received message on channel ${channel}, sending to handler`);

      receiver(jsonMessage, {
        ack: () => {
          this.client.ack(message, false);
        }
      });
    }
  }

  _addReceiverToCache(channel: string, receiver: any): void {
    this._receiveCache.push({ channel, receiver });
  }

  _removeReceiverFromCache(channel: string, receiver: any): void {
    this._receiveCache = this._receiveCache.filter(item => item.channel !== channel || item.receiver !== receiver);
  }

  _bindReceiver(channel: string, receiver: any): Promise<void> {
    logger.debug(`MessagingManager: binding receiver to channel ${channel}`);

    return this.client.subscribeToDurableQueue(channel, channel, this._wrapReceiver(channel, receiver));
  }

  _bindCachedReceivers(): Promise<void[]> {
    return Promise.all(this._receiveCache.map(item => this._bindReceiver(item.channel, item.receiver)));
  }

  _sendBufferedMessages(): void {
    return this._sendBuffer.forEach(item => {
      this.get(item.key).send(item.message);
    });
  }
}