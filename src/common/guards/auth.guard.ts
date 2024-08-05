import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../features/security/auth/decorators/public.decorator';
import { jwtConstants } from '../../features/security/auth/setting/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}
  // метод canActivate, который принимает объект ExecutionContext и возвращает Promise.
  // Этот метод определяет, разрешено ли выполнение запроса.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // извлекает значение метаданных с ключом IS_PUBLIC_KEY из контекста выполнения и проверяет,
    // является ли запрашиваемый маршрут публичным.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // если маршрут помечен как публичный,
      // то разрешает выполнение запроса без дополнительной проверки и возвращает true.
      return true;
    }
    // получает объект запроса из контекста выполнения
    const request = context.switchToHttp().getRequest();
    //извлекает токен из заголовка авторизации запроса.
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      // проверяет и верифицирует токен с использованием JwtService и секретного ключа.
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      // присваивает расшифрованный пейлоад токена к объекту запроса,
      // чтобы он был доступен в обработчиках маршрутов.
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  // приватный метод extractTokenFromHeader:,
  // который принимает объект запроса Request и извлекает токен из заголовка авторизации запроса.
  // const [type, token] = request.headers.authorization?.split(' ') ?? [];
  // - извлекает значение заголовка Authorization из объекта запроса, разделяет его по пробелу на две части (тип и сам токен)
  // и присваивает значения переменным type и token. Если заголовок Authorization отсутствует, или не содержит пробела,
  // то присваивается пустой массив.
  //
  // return type === 'Bearer' ? token : undefined; - проверяет, является ли тип токена 'Bearer'. Если это так,
  // то возвращает сам токен, иначе возвращает undefined.
}
