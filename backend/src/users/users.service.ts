import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Repéré lors de l'analyse d'ensemble (en vérifiant, pour le journal d'activité de la
   * phase 6, que toutes les routes de mutation admin étaient bien couvertes) : le
   * changement de rôle d'un compte (`roleName`) partage la même permission générale
   * (`users:update`/`users:create`) que les champs ordinaires (nom, email, statut), sans
   * permission dédiée — même schéma que celui corrigé en phase 2 sur les
   * promotions/produits/actualités/pages, où un champ sensible pouvait être modifié via le
   * DTO général au lieu de passer par une route dédiée exigeant la bonne permission.
   * Aujourd'hui, seul le Super Admin détient une permission `users:*` (vérifié dans le
   * seed), donc rien n'est exploitable en pratique. Mais si un rôle intermédiaire recevait
   * un jour `users:update` sans être pour autant digne de confiance au niveau Super Admin
   * (ex. un Gestionnaire autorisé à désactiver des comptes), rien n'empêcherait alors ce
   * rôle de s'accorder — ou d'accorder à un tiers — le rôle Super Admin. On bloque donc
   * explicitement l'attribution du rôle SUPER_ADMIN à quiconque n'est pas déjà lui-même
   * Super Admin, quel que soit le détail des permissions `users:*` qu'il détient par
   * ailleurs.
   */
  private assertCanAssignRole(targetRoleName: string, callerRoleName: string | undefined) {
    if (targetRoleName === 'SUPER_ADMIN' && callerRoleName !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Seul un Super Admin peut accorder le rôle Super Admin à un compte.');
    }
  }

  /**
   * Empêche de se retrouver sans aucun Super Admin actif (verrou impossible à lever
   * soi-même, puisque toute la gestion des comptes est elle-même réservée au Super Admin) :
   * ni désactiver, ni rétrograder, ni supprimer le dernier compte Super Admin actif restant.
   */
  private async assertNotLastActiveSuperAdmin(userId: string, action: 'désactiver' | 'rétrograder' | 'supprimer') {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user || user.role.name !== 'SUPER_ADMIN' || !user.isActive) return;

    const otherActiveSuperAdmins = await this.prisma.user.count({
      where: { role: { name: 'SUPER_ADMIN' }, isActive: true, NOT: { id: userId } },
    });
    if (otherActiveSuperAdmins === 0) {
      throw new ForbiddenException(
        `Impossible de ${action} ce compte : c'est le dernier Super Admin actif, plus personne ne pourrait ` +
          'ensuite gérer les comptes administrateurs.',
      );
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.name,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));
  }

  private async findRoleOrThrow(roleName: string) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new NotFoundException(`Rôle "${roleName}" introuvable.`);
    return role;
  }

  private async findUserOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user;
  }

  async create(dto: CreateUserDto, callerRoleName?: string) {
    this.assertCanAssignRole(dto.roleName, callerRoleName);
    await this.authService.assertEmailAvailable(dto.email);
    const role = await this.findRoleOrThrow(dto.roleName);
    const passwordHash = await this.authService.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, roleId: role.id },
      include: { role: true },
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role.name };
  }

  async update(id: string, dto: UpdateUserDto, callerRoleName?: string) {
    await this.findUserOrThrow(id);

    if (dto.email) {
      // Comme à la création (assertEmailAvailable) : évite un 500 brut (violation de
      // contrainte unique Prisma) si l'email choisi appartient déjà à un autre compte.
      const conflicting = await this.prisma.user.findFirst({ where: { email: dto.email, NOT: { id } } });
      if (conflicting) throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    if (dto.roleName) {
      this.assertCanAssignRole(dto.roleName, callerRoleName);
    }
    if (dto.isActive === false) {
      await this.assertNotLastActiveSuperAdmin(id, 'désactiver');
    }
    if (dto.roleName && dto.roleName !== 'SUPER_ADMIN') {
      // Rétrogradation potentielle du dernier Super Admin : assertNotLastActiveSuperAdmin
      // relit elle-même le compte et ne bloque que s'il est réellement Super Admin et actif,
      // donc ce garde-fou est un no-op silencieux pour tout autre compte.
      await this.assertNotLastActiveSuperAdmin(id, 'rétrograder');
    }

    const data: Record<string, unknown> = {};
    if (dto.name) data.name = dto.name;
    if (dto.email) data.email = dto.email;
    if (typeof dto.isActive === 'boolean') data.isActive = dto.isActive;
    if (dto.roleName) {
      const role = await this.findRoleOrThrow(dto.roleName);
      data.roleId = role.id;
    }
    if (dto.password) {
      data.passwordHash = await this.authService.hashPassword(dto.password);
    }

    const user = await this.prisma.user.update({ where: { id }, data, include: { role: true } });

    if (dto.isActive === false || dto.password) {
      // Même logique que pour une désactivation (ci-dessous) : un mot de passe qu'on vient de
      // réinitialiser doit invalider toute session ouverte avec l'ancien, plutôt que de
      // laisser un refresh token déjà émis rester utilisable jusqu'à sa prochaine tentative de
      // renouvellement (voir AuthService.refresh, qui vérifie isActive mais pas le mot de passe).
      await this.prisma.refreshToken.updateMany({ where: { userId: id, revoked: false }, data: { revoked: true } });
    }

    return { id: user.id, name: user.name, email: user.email, role: user.role.name, isActive: user.isActive };
  }

  async remove(id: string) {
    await this.findUserOrThrow(id);
    await this.assertNotLastActiveSuperAdmin(id, 'supprimer');
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
