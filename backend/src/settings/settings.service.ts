import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SETTINGS_ID = 'main';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Singleton : la ligne "main" est créée à la première lecture si le seed ne l'a pas
  // encore fait (ex. base migrée avant l'ajout de ce module).
  async get() {
    return this.prisma.setting.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });
  }

  async update(dto: UpdateSettingsDto) {
    // Une chaîne vide envoyée depuis le formulaire admin signifie "retirer ce lien", pas
    // "le laisser inchangé" — on la convertit donc en `null` plutôt que de la stocker telle
    // quelle (ce qui ferait apparaître une icône pointant vers une URL vide côté public).
    const data = Object.fromEntries(
      Object.entries(dto).map(([key, value]) => [key, value === '' ? null : value]),
    );
    return this.prisma.setting.upsert({
      where: { id: SETTINGS_ID },
      update: data,
      create: { id: SETTINGS_ID, ...data },
    });
  }
}
