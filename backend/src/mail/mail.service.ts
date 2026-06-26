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

  // Template de base (inchangé)
  private getBaseTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>projectStruct</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background-color: #88b28c;
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
          }
          .container {
            max-width: 560px;
            margin: 0 auto;
            background-color: #0f0f0f;
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #222;
            box-shadow: 0 20px 35px -12px rgba(0,0,0,0.5);
          }
          .header {
            background: linear-gradient(135deg, #0a1810 0%, #0f1f16 100%);
            padding: 32px 24px 24px;
            text-align: center;
            border-bottom: 1px solid #1f2f28;
          }
          .logo {
            font-family: 'Syne', monospace;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #ffffff 30%, #c9a84c 70%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 12px;
          }
          .logo span {
            background: linear-gradient(135deg, #c9a84c 30%, #2d7a52 70%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .tagline {
            font-size: 13px;
            color: #6b8f7a;
            letter-spacing: 0.3px;
          }
          .content {
            padding: 40px 32px;
            background-color: #0f0f0f;
          }
          .footer {
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #1a1a1a;
            background-color: #0a0a0a;
          }
          .footer-text {
            font-size: 12px;
            color: #3a4d3f;
          }
          h1, h2, h3 {
            font-family: 'Syne', sans-serif;
            font-weight: 600;
            letter-spacing: -0.3px;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #2d7a52, #1d5a3a);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            padding: 12px 28px;
            border-radius: 40px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(45, 122, 82, 0.2);
            border: none;
            cursor: pointer;
          }
          .btn:hover {
            transform: translateY(-1px);
            background: linear-gradient(135deg, #3a9468, #2d7a52);
            box-shadow: 0 8px 20px rgba(45, 122, 82, 0.3);
          }
          .code-block {
            background-color: #111;
            border: 1px solid #2a2a2a;
            border-radius: 20px;
            padding: 20px 24px;
            text-align: center;
            margin: 24px 0;
          }
          .code {
            font-family: 'DM Sans', monospace;
            font-size: 40px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #c9a84c;
            background: #0a0a0a;
            padding: 12px 16px;
            border-radius: 16px;
            display: inline-block;
          }
          .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 28px 0;
            color: #3a4d3f;
            font-size: 12px;
          }
          .divider::before,
          .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #222;
          }
          .divider::before {
            margin-right: 16px;
          }
          .divider::after {
            margin-left: 16px;
          }
          .info-note {
            background: #0a1810;
            border-left: 3px solid #c9a84c;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 12px;
            color: #9bb2a8;
            margin-top: 24px;
          }
          @media (max-width: 600px) {
            .content {
              padding: 28px 20px;
            }
            .code {
              font-size: 28px;
              letter-spacing: 6px;
            }
          }
        </style>
      </head>
      <body style="margin:0;padding:32px 16px;background-color:#0a0a0a;">
        <div class="container">
          <div class="header">
            <div class="logo">Project<span>Struct</span></div>
            <div class="tagline">construire · connecter · développer</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <div class="footer-text">© 2026 projectStruct – Tous droits réservés</div>
            <div class="footer-text" style="margin-top:8px;">L'écosystème d'innovation MENA</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendVerificationEmail(email: string, code: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verifyLink = `${frontendUrl}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    const content = `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#2d7a52,#1d5a3a);border-radius:18px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:28px;">✉️</span>
        </div>
        <h1 style="font-size:24px;color:#ffffff;margin-bottom:8px;">Vérifiez votre email</h1>
        <p style="color:#9bb2a8;font-size:14px;margin-bottom:24px;">
          Bienvenue sur projectStruct. Utilisez le code ci-dessous<br>
          ou cliquez sur le bouton pour activer votre compte.
        </p>
      </div>

      <div class="code-block">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#6b8f7a;margin-bottom:8px;">
          Code de vérification
        </div>
        <div class="code">${code}</div>
      </div>

      <div class="divider">ou</div>

      <div style="text-align:center;margin-bottom:16px;">
        <a href="${verifyLink}" class="btn">Vérifier mon email →</a>
      </div>

      <div class="info-note">
        🔐 Ce code et ce lien expirent dans <strong style="color:#c9a84c;">1 heure</strong>.<br>
        Si vous n'avez pas créé de compte, ignorez cet email.
      </div>
    `;

    await this.transporter.sendMail({
      from: `"projectStruct" <${this.configService.get<string>('MAIL_FROM')}>`,
      to: email,
      subject: '🔐 Vérifiez votre compte projectStruct',
      html: this.getBaseTemplate(content),
    });
  }

  async sendInvitation(email: string, incubatorName: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const inviteUrl = `${frontendUrl}/accept-invite?token=${token}`;

    const content = `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#c9a84c,#b88a2a);border-radius:18px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:28px;">🏢</span>
        </div>
        <h1 style="font-size:24px;color:#ffffff;margin-bottom:8px;">Vous êtes invité(e) !</h1>
        <p style="color:#9bb2a8;font-size:14px;margin-bottom:16px;">
          <strong style="color:#c9a84c;">${incubatorName}</strong> vous invite à rejoindre son espace incubateur.
        </p>
      </div>

      <div style="background:#111;border:1px solid #2a2a2a;border-radius:20px;padding:24px;margin:20px 0;text-align:center;">
        <p style="color:#e0e0e0;margin-bottom:20px;">
          En acceptant, vous pourrez collaborer avec les porteurs de projet et<br>
          accéder aux outils d'accompagnement.
        </p>
        <a href="${inviteUrl}" class="btn">Accepter l'invitation →</a>
      </div>

      <div class="info-note">
        ⏳ Ce lien expire dans <strong style="color:#c9a84c;">7 jours</strong>.<br>
        Si vous n'avez pas demandé cette invitation, ignorez cet email.
      </div>
    `;

    await this.transporter.sendMail({
      from: `"projectStruct" <${this.configService.get<string>('MAIL_FROM')}>`,
      to: email,
      subject: `📩 Invitation à rejoindre ${incubatorName}`,
      html: this.getBaseTemplate(content),
    });
  }

  async sendDocumentVerification(email: string, documentType: string, status: string): Promise<void> {
    const isApproved = status === 'approved';
    const statusColor = isApproved ? '#2d7a52' : '#c2410c';
    const icon = isApproved ? '✅' : '❌';
    const title = isApproved ? 'Document approuvé' : 'Document rejeté';
    const message = isApproved
      ? `Votre document "${documentType}" a été vérifié avec succès.`
      : `Votre document "${documentType}" n'a pas été validé. Veuillez soumettre une version conforme.`;

    const content = `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,${statusColor},${isApproved ? '#1d5a3a' : '#9a3412'});border-radius:18px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:28px;">${icon}</span>
        </div>
        <h1 style="font-size:24px;color:#ffffff;margin-bottom:8px;">${title}</h1>
        <p style="color:#9bb2a8;font-size:14px;margin-bottom:16px;">${message}</p>
      </div>

      <div style="background:#111;border:1px solid #2a2a2a;border-radius:20px;padding:20px;margin:20px 0;text-align:center;">
        <div style="font-size:12px;color:#6b8f7a;margin-bottom:8px;">Document concerné</div>
        <div style="font-weight:600;color:#c9a84c;">${documentType}</div>
        <div style="margin-top:16px;">
          <span style="display:inline-block;padding:4px 12px;border-radius:40px;background:${statusColor}20;color:${statusColor};font-size:12px;font-weight:600;">
            ${isApproved ? 'APPROUVÉ' : 'REJETÉ'}
          </span>
        </div>
      </div>

      ${!isApproved ? `
        <div class="info-note">
          📄 Pour toute question, contactez l’équipe support.<br>
          Vous pouvez soumettre un nouveau document depuis votre espace.
        </div>
      ` : `
        <div class="info-note">
          🎉 Votre profil est maintenant complet. Accédez à tous les services.
        </div>
      `}
    `;

    await this.transporter.sendMail({
      from: `"projectStruct" <${this.configService.get<string>('MAIL_FROM')}>`,
      to: email,
      subject: `${isApproved ? '✓ Document approuvé' : '✗ Document rejeté'} – projectStruct`,
      html: this.getBaseTemplate(content),
    });
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/auth/reset?token=${encodeURIComponent(token)}`;

    const content = `
      <div style="text-align:center;">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#c9a84c,#b88a2a);border-radius:18px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:28px;">🔐</span>
        </div>
        <h1 style="font-size:24px;color:#ffffff;margin-bottom:8px;">Réinitialisation du mot de passe</h1>
        <p style="color:#9bb2a8;font-size:14px;margin-bottom:24px;">
          Vous avez demandé à réinitialiser votre mot de passe.<br>
          Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
        </p>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <a href="${resetLink}" class="btn">Créer un nouveau mot de passe →</a>
      </div>

      <div class="info-note">
        ⏳ Ce lien expire dans <strong style="color:#c9a84c;">1 heure</strong>.<br>
        Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
      </div>
    `;

    await this.transporter.sendMail({
      from: `"projectStruct" <${this.configService.get<string>('MAIL_FROM')}>`,
      to: email,
      subject: '🔐 Réinitialisez votre mot de passe projectStruct',
      html: this.getBaseTemplate(content),
    });
  }
}