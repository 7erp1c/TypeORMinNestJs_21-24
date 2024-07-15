import { EmailAdapter } from './email-adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailsManager {
  constructor(private readonly emailAdapter: EmailAdapter) {}
  async sendMessageWitchConfirmationCode(
    email: string,
    login: string,
    code: string,
  ) {
    //отправку сообщения лучше обернуть в try-catch,
    //чтобы при ошибке(например отвалиться отправка) приложение не падало
    try {
      return await this.emailAdapter.sendEmail(
        //отправить сообщение на почту юзера с кодом подтверждения
        email,
        login,
        code,
      );
    } catch (e: unknown) {
      console.error('Send email error', e); //залогировать ошибку при отправке сообщения
    }
    return true;
  }

  async emailsManagerRecovery(email: string, code: string) {
    //отправку сообщения лучше обернуть в try-catch,
    // чтобы при ошибке(например отвалиться отправка) приложение не падало
    try {
      await this.emailAdapter.sendCodeRecoveryOnEmail(
        //отправить сообщение на почту юзера с кодом подтверждения
        email,
        code,
      );
    } catch (e: unknown) {
      console.error('Send email error', e); //залогировать ошибку при отправке сообщения
    }
    return true;
  }
}
