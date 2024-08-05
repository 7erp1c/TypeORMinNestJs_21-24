import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Entity, PrimaryColumn } from 'typeorm';

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

@Entity({ name: 'BlackList' })
export class BlackList {
  @PrimaryColumn()
  refreshToken: string;
}
