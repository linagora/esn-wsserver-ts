import { Socket } from 'socket.io';
import { verify, Algorithm, JwtPayload } from 'jsonwebtoken';
import { getSocketInfo, setUserId } from '../lib/helper';
import { NextFunction } from 'express';
import { fetchUser, getUser, registerUser } from '../lib/user';
import logger from '@server/lib/logger';

const { SECRET, ALGORITHM = 'RS256' } = process.env;

const handler = (socket: Socket, next: NextFunction): void => {
  const infos = getSocketInfo(socket);

  if (!infos || !infos.query) {
    logger.error('failed to extract socket info');

    return next(new Error('Invalid token'));
  }

  const { query } = infos;

  if (!query.token || !query.user) {
    logger.error('failed to extract token or user from query');

    return next(new Error('Missing Token or User'));
  }

  return verify(query.token as string, SECRET.replace(/\\n/g, '\n'), { algorithms: [ALGORITHM as Algorithm] }, (err, decoded) => {
    if (err || !decoded) {
      logger.error('failed to verify token', err);

      return next(new Error('Invalid Token'));
    }

    const { sub } = decoded as JwtPayload;

    if (!sub) {
      logger.error('failed to extract sub field from token');

      return next(new Error('Invalid Token, missing sub'));
    }

    const user = getUser(sub);

    if (user) {
      setUserId(socket, user._id);

      return next();
    }

    return fetchUser(query.token as string)
      .then(user => {
        if (!user) {
          return next(new Error('invalid user'));
        }

        registerUser(sub, user);
        setUserId(socket, user._id);

        return next();
      })
      .catch(err => {
        logger.error('failed to authenticate user', err);

        return next(new Error('Cannot fetch user'));
      });
  });
}

export default handler;
