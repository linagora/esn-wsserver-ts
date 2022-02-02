import logger from '../../lib/logger';
import manager from '../../lib/messaging';
import { EVENTS } from './constants';
import { parseContact, ParsedContact } from './helper';
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
  const payload: ParsedContact = parseContact(data);

  PubSub.publish(EVENTS.CONTACT_CREATED, payload);
}

const updatedContactHandler = (data: any): void => {
  const payload = parseContact(data);

  PubSub.publish(EVENTS.CONTACT_UPDATED, payload);
}

const deletedContactHandler = (data: any): void => { 
  const payload = parseContact(data);

  PubSub.publish(EVENTS.CONTACT_DELETED, payload);
}

const createdAddressBookHandler = (data: any): void => { console.log(data) }
const updatedAddressBookHandler = (data: any): void => { console.log(data) }
const deletedAddressBookHandler = (data: any): void => { console.log(data) }
const createdAddressBookSubscriptionHandler = (data: any): void => { console.log(data) }
const updatedAddressBookSubscriptionHandler = (data: any): void => { console.log(data) }
const deletedAddressBookSubscriptionHandler = (data: any): void => { console.log(data) }
