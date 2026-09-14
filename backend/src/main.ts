import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Nécessaire pour lire les cookies d'authentification httpOnly (voir auth/cookies.ts) :
  // Express n'expose pas `req.cookies` par défaut, seulement l'en-tête brut `Cookie`.
  app.use(cookieParser());

  // Nécessaire dès que l'API tourne derrière un reverse proxy/load balancer (Nginx,
  // Cloudflare...) : sans ça, Express voit l'IP du proxy comme `req.ip` pour CHAQUE visiteur,
  // donc l'anti-spam du formulaire de contact (ContactMessagesService) et la limitation des
  // tentatives de connexion (ThrottlerGuard sur /auth) partageraient tous le même quota — un
  // visiteur légitime pourrait se retrouver bloqué par le trafic d'un autre. Documenté comme
  // limite connue dans le README ; non activé par défaut pour ne rien changer en développement
  // (pas de proxy ici) ni casser un déploiement sans proxy, où faire confiance à un
  // `X-Forwarded-For` arbitraire permettrait au contraire de FALSIFIER `req.ip` et de
  // contourner ces mêmes limites.
  // Valeurs acceptées (voir doc Express `trust proxy`) : nombre de sauts (ex. "1" pour un
  // reverse proxy juste devant l'API), IP/sous-réseau(x) séparés par des virgules, ou "true"
  // (à réserver à un déploiement dont on maîtrise entièrement la chaîne réseau).
  const trustProxy = config.get<string>('TRUST_PROXY');
  if (trustProxy) {
    app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
  }

  // En-têtes de sécurité standard (X-Content-Type-Options, X-Frame-Options, etc.) — trouvé
  // manquant lors de l'analyse d'ensemble. `crossOriginResourcePolicy` est désactivé car
  // les images de /uploads sont volontairement consommées cross-origin par le front-end
  // (voir CORS_ORIGIN ci-dessous et next.config.mjs) ; `contentSecurityPolicy` est laissé au
  // défaut, cette API ne servant aucune page HTML elle-même en dehors de /uploads.
  app.use(helmet({ crossOriginResourcePolicy: false }));

  // Échec rapide et explicite si les secrets JWT ne sont pas configurés, plutôt qu'un
  // plantage confus (et un 500 générique) au tout premier login/refresh — jsonwebtoken
  // refuse de signer un token avec une clé vide/`undefined`.
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
    if (!config.get<string>(key)) {
      throw new Error(
        `Variable d'environnement ${key} manquante ou vide. Voir backend/.env.example.`,
      );
    }
  }

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API Amza Futur Telecom démarrée sur http://localhost:${port}/api`);
}

bootstrap();
