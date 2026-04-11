// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // Mailtrap demande false pour le port 2525 ou 587
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
    rejectUnauthorized: false // Aide à éviter les erreurs de certificat en local
  }
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Vérification de votre compte ProjectStruct',
      html: `
        <div style="font-family: sans-serif;">
          <h1>Bienvenue !</h1>
          <p>Cliquez sur le bouton ci-dessous pour valider votre inscription :</p>
          <a href="${verificationLink}" style="background: #007bff; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">
            Vérifier mon email
          </a>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
  
}