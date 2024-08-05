import { Observable } from 'rxjs';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_METHODS } from '../../settings/app-settings';

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.header('authorization')?.split(' '); // Получаем значение поля в заголовке
      const authMethod = authHeader[0]; // получаем метод из заголовка
      const authInput = authHeader[1]; // получаем значение для авторизации из заголовка(формат basic64)
      const auth = btoa(`${'admin'}:${'qwerty'}`); // кодируем наши логин и пароль в basic64

      if (authInput === auth && authMethod === AUTH_METHODS.base) {
        return true;
      } else {
        // throw new UnauthorizedException({
        //   message: 'Authorization failed, bad login or password',
        // });
        throw new HttpException(
          'Bad login or password',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch {
      throw new HttpException(
        'Authorization failed, bad login or password',
        HttpStatus.UNAUTHORIZED,
      );

      //throw new Error(error);

      // throw new UnauthorizedException({
      //   message: 'Authorization failed, bad login or password',
      // });
    }
  }
}
