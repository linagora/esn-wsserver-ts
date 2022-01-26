export const AMQP_DISCONNECTED_TOPIC = 'amqp:disconnected';
export const AMQP_CONNECTED_TOPIC = 'amqp:disconnected';
export const AMQP_CLIENT_CONNECTED_TOPIC = "amqp:client:available";

export const PUBSUB_EXCHANGE = {
  type: 'fanout',
  routingKey: '',
  encoding: 'utf8'
}

export const SUBSCRIBER = {
  queueName: undefined,
    queueOptions: {
    exclusive: true,
      durable: false,
        autoDelete: true
  },
  durableQueueOptions: {
    exclusive: false,
      durable: true,
        autoDelete: false
  },
  consumeOptions: { noAck: false }
}