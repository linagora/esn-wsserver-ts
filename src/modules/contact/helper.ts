import * as ICAL from 'ical.js';
import { MODE } from './constants';

export type ContactInformation = {
  bookId: string;
  bookName: string;
  contactId: string;
}

export type ParsedContact = ContactInformation & {
  userId?: string;
  vcard?: any,
  mode?: string;
}

export type AddressbookInformation = {
  bookId: string;
  bookName: string;
}

export type ParsedAddressbook = AddressbookInformation & {
  userId?: string;
}

export type Principal = {
  type: string;
  id: string;
}

export const parseContact = (data: any): ParsedContact => {
  const contactData: ParsedContact | null = parseContactPath(data.path);

  if (data.owner) {
    contactData.userId = parsePrincipal(data.owner).id;
  }

  if (data.carddata) {
    contactData.vcard = ICAL.Component.fromString(data.carddata);
  }

  return contactData;
}

const parseContactPath = (path: string): ContactInformation | null => {
  const match = String(path).match(/addressbooks\/(.*?)\/(.*?)\/(.*?)\.vcf/);

  return match ? {
    bookId: match[1],
    bookName: match[2],
    contactId: match[3]
  } : null;
}

export const parseAddressBookPath = (path: string): AddressbookInformation | null => {
  const match = String(path).match(/addressbooks\/(.*?)\/(.*?)$/);

  return match ? {
    bookId: match[1],
    bookName: match[2]
  } : null;
}

const parsePrincipal = (path: string): Principal | null => {
  const match = String(path).match(/^principals\/(.*?)\/(.*?)$/);

  return match ? {
    type: match[1],
    id: match[2]
  } : null;
}

export const shouldSkipNotification = (data: ParsedContact): boolean => data?.mode === MODE.IMPORT;

export const parseAddressbook = (data: any): ParsedAddressbook => {
  const addressbookData: ParsedAddressbook | null = parseAddressBookPath(data.path);

  if (data.owner) {
    addressbookData.userId = parsePrincipal(data.owner).id;
  }

  return addressbookData;
}
