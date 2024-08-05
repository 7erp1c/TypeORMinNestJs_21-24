// import { Injectable, ExecutionContext } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { ThrottlerGuard } from '@nestjs/throttler';
//
// @Injectable()
// export class AuthThrottlerGuard extends AuthGuard('jwt') {
//   constructor(private readonly throttlerGuard: ThrottlerGuard) {
//     super();
//   }
//
//   canActivate(context: ExecutionContext) {
//     // Применяем AuthGuard и ThrottlerGuard
//     return (
//       super.canActivate(context) && this.throttlerGuard.canActivate(context)
//     );
//   }
// }
