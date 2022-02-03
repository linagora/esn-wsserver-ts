import logger from '../../lib/logger';
import manager from '../../lib/messaging';
import { EVENTS } from './constants';
import { parseAddressbook, parseContact } from './helper';
import PubSub from 'pubsub-js';

export const init = (): void => {
  logger.info('MessagingManager: listening to contacts messages');

  manager.get(EVENTS.CONTACT_CREATED).receive(createdContactHandler);
  manager.get(EVENTS.CONTACT_UPDATED).receive(updatedContactHandler);
  manager.get(EVENTS.CONTACT_DELETED).receive(deletedContactHandler);
  manager.get(EVENTS.ADDRESSBOOK_CREATED).receive(createdAddressBookHandler);
  manager.get(EVENTS.ADDRESSBOOK_UPDATED).receive(updatedAddressBookHandler);
  manager.get(EVENTS.ADDRESSBOOK_DELETED).receive(deletedAddressBookHandler);
  manager.get(EVENTS.ADDRESSBOOK_SUBSCRIPTION_CREATED).receive(createdAddressBookSubscriptionHandler);
  manager.get(EVENTS.ADDRESSBOOK_SUBSCRIPTION_UPDATED).receive(updatedAddressBookSubscriptionHandler);
  manager.get(EVENTS.ADDRESSBOOK_SUBSCRIPTION_DELETED).receive(deletedAddressBookSubscriptionHandler);
}

const createdContactHandler = (data: any): void => {
  PubSub.publish(EVENTS.CONTACT_CREATED, parseContact(data));
}

const updatedContactHandler = (data: any): void => {
  PubSub.publish(EVENTS.CONTACT_UPDATED, parseContact(data));
}

const deletedContactHandler = (data: any): void => {
  PubSub.publish(EVENTS.CONTACT_DELETED, parseContact(data));
}

const createdAddressBookHandler = (data: any): void => {
  PubSub.publish(EVENTS.ADDRESSBOOK_CREATED, parseAddressbook(data));
}

const updatedAddressBookHandler = (data: any): void => {
  PubSub.publish(EVENTS.ADDRESSBOOK_UPDATED, parseAddressbook(data));
}

const deletedAddressBookHandler = (data: any): void => {
  PubSub.publish(EVENTS.ADDRESSBOOK_DELETED, parseAddressbook(data));
}

const createdAddressBookSubscriptionHandler = (data: any): void => {
  PubSub.publish(EVENTS.ADDRESSBOOK_SUBSCRIPTION_CREATED, parseAddressbook(data));
}

const updatedAddressBookSubscriptionHandler = (data: any): void => {
  PubSub.publish(EVENTS.ADDRESSBOOK_SUBSCRIPTION_UPDATED, parseAddressbook(data));
}

const deletedAddressBookSubscriptionHandler = (data: any): void => {
  PubSub.publish(EVENTS.ADDRESSBOOK_SUBSCRIPTION_DELETED, parseAddressbook(data));
}
