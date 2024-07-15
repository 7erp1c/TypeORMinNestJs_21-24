import { UserDocument } from '../../../domain/user.entity';
import { ObjectId } from 'mongoose';
import { UserOutputDto } from './output';

export class UserOutputModel {
  id: string;
  login: string;
  email: string;
}
// MAPPERS
export const UserOutputModelMapper = (user: UserDocument): UserOutputDto => {
  const outputModel = new UserOutputDto();

  outputModel.id = user.id;
  outputModel.login = user.login;
  outputModel.email = user.email;
  outputModel.createdAt = user.createdAt;

  return outputModel;
};
