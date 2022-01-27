import logger from '@server/lib/logger';
import manager from '@server/lib/messaging';
import { EVENTS } from './constants';


export const listen = (): void => {
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

const createdContactHandler = (data: any): void => { console.log(data) }
const updatedContactHandler = (data: any): void => { console.log(data) }
const deletedContactHandler = (data: any): void => { console.log(data) }
const createdAddressBookHandler = (data: any): void => { console.log(data) }
const updatedAddressBookHandler = (data: any): void => { console.log(data) }
const deletedAddressBookHandler = (data: any): void => { console.log(data) }
const createdAddressBookSubscriptionHandler = (data: any): void => { console.log(data) }
const updatedAddressBookSubscriptionHandler = (data: any): void => { console.log(data) }
const deletedAddressBookSubscriptionHandler = (data: any): void => { console.log(data) }
