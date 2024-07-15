import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

export type UserDocument = HydratedDocument<User>;
const uniqueCode = uuidv4();
const createdAt = add(new Date(), { hours: 48 }).toISOString();
@Schema()
export class User {
  @Prop()
  login: string;
  @Prop()
  email: string;
  @Prop()
  hash: string;
  @Prop()
  createdAt: string;
  @Prop({
    _id: false,
    type: {
      confirmationCode: String,
      expirationDate: Date,
      isConfirmed: Boolean,
    },
    default: {
      confirmationCode: uniqueCode.toString(),
      expirationDate: createdAt,
      isConfirmed: false,
    },
  })
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: string;
    isConfirmed: boolean;
  };
  @Prop({
    _id: false,
    type: { recoveryCode: String, expirationDate: Date, isUsed: Boolean },
    default: {
      recoveryCode: uniqueCode.toString(),
      expirationDate: createdAt,
      isUsed: false,
    },
  })
  recoveryPassword: {
    recoveryCode: string;
    expirationDate: string;
    isUsed: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
