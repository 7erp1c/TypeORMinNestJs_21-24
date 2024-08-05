import { Schema } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

export class UserOutputDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}
export class UserOutput {
  _id: ObjectId;
  login: string;
  email: string;
}
export class CreateUserDto {
  login: string;
  email: string;
  hash: string;
  /*isConfirmed: boolean;*/
}

@Schema()
export class UserType {
  login: string;
  email: string;
  hash: string;
  createdAt: string;
}
