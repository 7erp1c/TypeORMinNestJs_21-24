import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type SessionDocument = HydratedDocument<Session>;

@Schema()
class RefreshTokenSchema {
  @Prop()
  createdAt: string;

  @Prop()
  expiredAt: string;
}

@Schema()
export class Session {
  @Prop()
  userId: string;

  @Prop()
  deviceId: string;

  @Prop()
  deviceTitle: string;

  @Prop()
  ip: string;

  @Prop()
  lastActiveDate: string;

  @Prop({ type: RefreshTokenSchema })
  refreshToken: {
    createdAt: string;
    expiredAt: string;
  };
}

export const DevicesSchema = SchemaFactory.createForClass(Session);
