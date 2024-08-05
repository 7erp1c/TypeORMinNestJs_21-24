import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { appSettings } from '../../../settings/app-settings';

// interface Options {
//   callbackOnLocationHash?: boolean;
//   link?: string;
// }
@Injectable()
export class EmailAdapter {
  async sendEmail(email: string, login: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // с гуглом остальное не надо

      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      // почта и пароль для рассылки:
      auth: {
        user: 'th.great.forest@gmail.com', //My Email
        pass: appSettings.api.GMAIL_COM_PASS, // My pass
      },
    });
    //async function main() {// async..await is not allowed in global scope, must use a wrapper
    // send mail with defined transport object
    return await transporter.sendMail({
      from: '"Ratmir" <th.great.forest@gmail.com>', // sender address
      to: email, // list of receivers
      subject: `User registration`, // Subject line
      html: `<h1>Thank for your registration</h1>
                  <p>User login: ${login},</p>                
                  <p>To finish registration please follow the link below:
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
                  </p>`, // html body
      //link: `<https://some-front.com/confirm-registration?code=${code}>`
    });

    //console.log("Message sent: %s", info.messageId, info);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>

    // }
    // main().catch(console.error);
  }
  async sendCodeRecoveryOnEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // с гуглом остальное не надо
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      //почта и пароль для рассылки:
      auth: {
        user: 'th.great.forest@gmail.com', //My Email
        pass: appSettings.api.GMAIL_COM_PASS, // My pass
      },
    });
    //async function main() {// async..await is not allowed in global scope, must use a wrapper
    // send mail with defined transport object
    return await transporter.sendMail({
      from: '"Ratmir" <th.great.forest@gmail.com>', // sender address
      to: email,
      subject: `Password recovery`,
      html: `<h1>Password recovery</h1>
            <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`,
    });
  }
}
