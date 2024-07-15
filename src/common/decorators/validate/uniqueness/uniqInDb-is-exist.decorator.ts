//Валидатор для проверки уникальности
//значения в базе данных с использованием библиотеки class-validator в Nest.js.
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
//import { UsersRepository } from '../../../../features/users/infrastructure/users.repository';
import { Injectable } from '@nestjs/common';
import { UsersRepositorySql } from '../../../../features/users/sql.infrastructure/user.repository.sql';

// Обязательна регистрация в ioc
@ValidatorConstraint({ name: 'UniqIsExist', async: true }) //: Декоратор @ValidatorConstraint
// используется для определения кастомного валидатора. Он принимает объект с
// настройками, в данном случае, указывается имя валидатора (UniqIsExist)
// и устанавливается асинхронный режим валидации.
@Injectable()
export class InputUniqDataIsExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    //private readonly usersRepository: UsersRepository, //mongoose
    private readonly usersRepositorySql: UsersRepositorySql,
  ) {}
  //: Метод validate выполняет проверку уникальности значения, вызывая метод
  // valueIsExist из UsersRepository. Он возвращает true, если значение
  // уникально, и false, если оно уже существует в базе данных.
  async validate(value: any, args: ValidationArguments) {
    const emailIsExist = await this.usersRepositorySql.valueIsExist(
      args.property,
      value,
    );
    return !emailIsExist;
  }
  // Метод defaultMessage возвращает сообщение об ошибке,
  // которое будет отображаться при неудачной валидации.
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} ${validationArguments?.value} already exist`;
  }
}

// https://github.com/typestack/class-validator?tab=readme-ov-file#custom-validation-decorators
//Это фабричная функция, которая создает декоратор для использования кастомного
// валидатора. Она регистрирует кастомный валидатор с помощью registerDecorator
// из class-validator, указывая целевой объект, свойство, опции валидации и сам
// кастомный валидатор InputUniqDataIsExistConstraint.
export function UniqIsExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: InputUniqDataIsExistConstraint,
    });
  };
}
