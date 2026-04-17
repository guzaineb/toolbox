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

  async sendVerificationEmail(email: string, code: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // ✅ token ET email inclus dans le lien
    const verifyLink = `${frontendUrl}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Vérification de votre compte</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Project<span style="color:#6366f1;">Struct</span>
              </span>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:40px 36px;">

              <!-- ICON -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="width:56px;height:56px;background:linear-gradient(135deg,#6366f1,#818cf8);border-radius:14px;display:inline-block;text-align:center;line-height:56px;font-size:26px;">
                      ✉️
                    </div>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom:10px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                      Vérifiez votre email
                    </h1>
                  </td>
                </tr>

                <!-- SUBTITLE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#888;line-height:1.6;">
                      Bienvenue sur ProjectStruct. Utilisez le code ci-dessous<br/>ou cliquez sur le bouton pour activer votre compte.
                    </p>
                  </td>
                </tr>

                <!-- OTP CODE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <div style="background-color:#111;border:1px solid #2a2a2a;border-radius:12px;padding:20px 32px;display:inline-block;">
                      <p style="margin:0 0 6px 0;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
                        Code de vérification
                      </p>
                      <p style="margin:0;font-size:36px;font-weight:800;color:#ffffff;letter-spacing:10px;">
                        ${code}
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-top:1px solid #2a2a2a;"></td>
                        <td style="padding:0 14px;color:#555;font-size:12px;white-space:nowrap;">ou</td>
                        <td style="border-top:1px solid #2a2a2a;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- CTA BUTTON -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${verifyLink}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#818cf8);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
                      Vérifier mon email →
                    </a>
                  </td>
                </tr>
                <!-- EXPIRY NOTE -->
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:12px;color:#555;line-height:1.6;">
                      Ce code et ce lien expirent dans <strong style="color:#888;">1 heure</strong>.<br/>
                      Si vous n'avez pas créé de compte, ignorez cet email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#444;">
                © 2025 ProjectStruct · Tous droits réservés
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await this.transporter.sendMail({
      from: `"ProjectStruct" <${this.configService.get<string>('MAIL_FROM')}>`,
      to: email,
      subject: '🔐 Vérifiez votre compte ProjectStruct',
      html,
    });
  }
}