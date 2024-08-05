import { getAuthTypeEndpointMe } from './output';

import { ObjectId } from 'mongoose';
import { UserOutput } from '../../../../../users/api/models/output/output';

export const getAuthUsersView = (
  dbAuthUsers: UserOutput,
): getAuthTypeEndpointMe => {
  return {
    email: dbAuthUsers.email,
    login: dbAuthUsers.login,
    userId: (dbAuthUsers._id as ObjectId).toString(),
  };
};
