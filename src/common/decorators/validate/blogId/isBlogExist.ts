import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Blog } from '../../../../features/blogs/blogs/domain/blogs.entity';

function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

@ValidatorConstraint({ async: true })
@Injectable()
export class BlogExistsValidator implements ValidatorConstraintInterface {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async validate(blogId: string, args: ValidationArguments) {
    if (!blogId) return true; // Если blogId не предоставлен, считаем его валидным (опциональным)
    if (!isValidObjectId(blogId)) {
      // Если blogId не является допустимым ObjectId, возвращаем false
      return false;
    }
    const blogExists = await this.blogModel.exists({
      _id: new ObjectId(blogId),
    });
    return !!blogExists;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Блог с таким ID не существует.';
  }
}

export function IsBlogExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BlogExistsValidator,
    });
  };
}
