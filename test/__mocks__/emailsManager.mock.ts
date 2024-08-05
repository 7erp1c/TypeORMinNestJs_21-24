// import { jest } from '@jest/globals';
// // emailsManager.__mocks__.ts
// const EmailsManager = {
//   sendMessageWitchConfirmationCode: jest.fn().mockResolvedValue(true),
// };
//
// export default EmailsManager;
// Создаем объект emailServiceMock, чтобы замокать класс EmailsManager
import { EmailsManager } from '../../src/common/service/email/email-manager';
//
// export class EmailServiceMock  {
//   // Добавляем emailAdapter с экземпляром EmailAdapter
//   async sendEmail(
//     email: string,
//     login: string,
//     code: string,
//   ): Promise<true> {
//     return true;
//   },
//   async emailsManagerRecovery(email: string, code: string): Promise<true> {
//     return true;
//   },
// };
