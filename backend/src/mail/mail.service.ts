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
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: { rejectUnauthorized: false },
    });
  }

  // ✅ Signature corrigée : 3 arguments (email, code, token)
  async sendVerificationEmail(email: string, code: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const linkWithCode = `${frontendUrl}/auth/verify-email`;
    const plainLink = `${frontendUrl}/auth/verify-email`;

    const html = `
      <div style="font-family: sans-serif;">
        <h1>Bienvenue sur ProjectStruct</h1>
        <p>Votre code de vérification est :</p>
        <h2 style="background: #f4f4f4; padding: 10px; display: inline-block;">${code}</h2>
        <p>Vous pouvez également cliquer sur ce lien pour vérifier automatiquement :</p>
        <a href="${linkWithCode}" style="background: #007bff; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">
          Vérifier mon email
        </a>
        <p>Ou saisir le code manuellement sur : ${plainLink}</p>
        <p>Ce code expirera dans 1 heure.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Vérification de votre compte ProjectStruct',
      html,
    });
  }
}