import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshTokenBlackListDocument =
  HydratedDocument<RefreshTokenBlackList>;
@Schema()
export class RefreshTokenBlackList {
  @Prop()
  refreshToken: string;
}

export const RefreshTokenBlackListSchema = SchemaFactory.createForClass(
  RefreshTokenBlackList,
);
