import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer');

function buildConfig(values: Record<string, string> = {}): ConfigService {
  return { get: (key: string, fallback?: string) => values[key] ?? fallback } as unknown as ConfigService;
}

describe('MailService', () => {
  it('ne construit aucun transporteur et ne lève rien quand SMTP_HOST est vide (no-op)', async () => {
    const service = new MailService(buildConfig());
    await expect(service.send({ to: 'a@example.com', subject: 'Test', html: '<p>x</p>' })).resolves.toBeUndefined();
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('envoie via le transporteur SMTP configuré quand SMTP_HOST est renseigné', async () => {
    const sendMail = jest.fn().mockResolvedValue({});
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

    const service = new MailService(
      buildConfig({ SMTP_HOST: 'smtp.example.com', SMTP_USER: 'u', SMTP_PASS: 'p', SMTP_FROM: 'from@example.com' }),
    );
    await service.send({ to: 'a@example.com', subject: 'Test', html: '<p>x</p>' });

    expect(sendMail).toHaveBeenCalledWith({ from: 'from@example.com', to: 'a@example.com', subject: 'Test', html: '<p>x</p>' });
  });

  it('n’échoue jamais si l’envoi SMTP lui-même échoue (l’action métier appelante ne doit pas planter)', async () => {
    const sendMail = jest.fn().mockRejectedValue(new Error('SMTP down'));
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

    const service = new MailService(buildConfig({ SMTP_HOST: 'smtp.example.com' }));
    await expect(service.send({ to: 'a@example.com', subject: 'Test', html: '<p>x</p>' })).resolves.toBeUndefined();
  });
});
