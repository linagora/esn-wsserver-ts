import axios from 'axios'
import logger from '../logger';

const { OPENPAAS_URL } = process.env;
const USER_ENDPOINT = `${OPENPAAS_URL}/api/user`;

interface User {
  _id: string;
}

type UserStore = Record<string, User>;

const store: UserStore = {};

export const registerUser = (identifier: string, user: User): void => {
  store[identifier] = user;
}

export const getUser = (identifier: string): User | null => {
  return store[identifier];
}

export const fetchUser = (jwt: string): Promise<User> => {
  return axios.get(USER_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    }
  })
  .then(({ data }) => data)
  .catch(err => {
    logger.error('failed to fetch user', err);
  })
}
