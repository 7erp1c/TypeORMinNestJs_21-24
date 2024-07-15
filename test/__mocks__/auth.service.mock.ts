import { AuthService } from '../../src/features/auth/aplication/auth.service';
import { UsersService } from '../../src/features/users/application/users.service';
import { EmailsManager } from '../../src/common/service/email/email-manager';
import { DateCreate } from '../../src/base/adapters/get-current-date';
import { RandomNumberService } from '../../src/common/service/random/randomNumberUUVid';
import { BcryptAdapter } from '../../src/base/adapters/bcrypt.adapter';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../src/common/service/jwt/token.service';

export class AuthServiceMock extends AuthService {
  constructor(
    usersService: UsersService,
    tokenService: TokenService,
    jwtService: JwtService,
    bcryptAdapter: BcryptAdapter,
    randomNumberService: RandomNumberService,
    emailsManager: EmailsManager,
    dateCreate: DateCreate,
  ) {
    super(
      usersService,
      tokenService,
      jwtService,
      bcryptAdapter,
      randomNumberService,
      emailsManager,
      dateCreate,
    );
  }
  sendEmail() {
    // Здесь можно добавить логику мокирования, если нужно
    return Promise.resolve(true);
  }
}
