import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envoi d'email générique (SMTP), configuré via SMTP_HOST/PORT/USER/PASS/FROM (.env — voir
 * .env.example). Compatible avec n'importe quel fournisseur SMTP standard (Resend, SendGrid,
 * Gmail avec mot de passe d'application...), pas de dépendance à un SDK propriétaire.
 *
 * Tant qu'Amza n'a pas créé de compte chez un fournisseur et rempli SMTP_HOST, ce service ne
 * plante jamais : il journalise l'email qu'il AURAIT envoyé et ne fait rien d'autre (no-op).
 * Ça permet de brancher dès maintenant les appels (confirmation de commande, accusé de
 * réception de message) sans attendre que ce compte existe, et de les activer plus tard par
 * simple ajout de variables d'environnement, sans changement de code.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>('SMTP_FROM', 'no-reply@amzafuturtelecom.com');

    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async send({ to, subject, html }: SendMailInput): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[SMTP non configuré, email non envoyé] À: ${to} — Sujet: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      this.logger.log(`Email envoyé à ${to} — Sujet: ${subject}`);
    } catch (error) {
      // Ne doit JAMAIS faire échouer l'action métier qui déclenche l'email (même principe
      // que ActivityLogService.record) : une commande passée avec succès ne doit pas devenir
      // une erreur 500 juste parce que l'envoi de sa confirmation par email a échoué.
      this.logger.error(`Échec d'envoi d'email à ${to} : ${(error as Error).message}`);
    }
  }
}
