import { applyDecorators } from '@nestjs/common';
import { Trim } from '../transform/trim';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export const IsStringLength = (min: number, max: number) => {
  return applyDecorators(Trim(), IsString(), IsNotEmpty(), Length(min, max));
};
