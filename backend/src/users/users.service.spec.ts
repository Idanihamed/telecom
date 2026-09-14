import { ConflictException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

function buildUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    name: 'Compte',
    email: 'compte@example.com',
    isActive: true,
    role: { name: 'SUPER_ADMIN' },
    ...overrides,
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: { findUnique: jest.Mock; findFirst: jest.Mock; count: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
    role: { findUnique: jest.Mock };
    refreshToken: { updateMany: jest.Mock };
  };
  let authService: { assertEmailAvailable: jest.Mock; hashPassword: jest.Mock };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
      },
      role: { findUnique: jest.fn().mockResolvedValue({ id: 'role-1', name: 'EDITEUR' }) },
      refreshToken: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };
    authService = {
      assertEmailAvailable: jest.fn().mockResolvedValue(undefined),
      hashPassword: jest.fn().mockResolvedValue('hashed'),
    };
    service = new UsersService(prisma as unknown as PrismaService, authService as unknown as AuthService);
  });

  describe('create — escalade de privilèges', () => {
    it('refuse qu’un compte non Super Admin crée un nouveau Super Admin', async () => {
      await expect(
        service.create(
          { name: 'X', email: 'x@example.com', password: '1234567890', roleName: 'SUPER_ADMIN' },
          'GESTIONNAIRE',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('autorise un Super Admin à créer un autre Super Admin', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 'role-sa', name: 'SUPER_ADMIN' });
      prisma.user.create.mockResolvedValue(buildUser());
      await expect(
        service.create(
          { name: 'X', email: 'x@example.com', password: '1234567890', roleName: 'SUPER_ADMIN' },
          'SUPER_ADMIN',
        ),
      ).resolves.toBeDefined();
    });

    it('autorise n’importe quel appelant à créer un compte avec un rôle non-Super-Admin', async () => {
      prisma.user.create.mockResolvedValue(buildUser({ role: { name: 'EDITEUR' } }));
      await expect(
        service.create(
          { name: 'X', email: 'x@example.com', password: '1234567890', roleName: 'EDITEUR' },
          'GESTIONNAIRE',
        ),
      ).resolves.toBeDefined();
    });

    it('propage le conflit d’email déjà pris', async () => {
      authService.assertEmailAvailable.mockRejectedValue(new ConflictException());
      await expect(
        service.create({ name: 'X', email: 'x@example.com', password: '1234567890', roleName: 'EDITEUR' }, 'SUPER_ADMIN'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update — verrou du dernier Super Admin actif', () => {
    it('refuse de désactiver le dernier Super Admin actif', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser());
      prisma.user.count.mockResolvedValue(0); // aucun AUTRE Super Admin actif
      await expect(service.update('user-1', { isActive: false }, 'SUPER_ADMIN')).rejects.toThrow(ForbiddenException);
    });

    it('autorise la désactivation s’il reste un autre Super Admin actif', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser());
      prisma.user.count.mockResolvedValue(1);
      prisma.user.update.mockResolvedValue(buildUser({ isActive: false }));
      await expect(service.update('user-1', { isActive: false }, 'SUPER_ADMIN')).resolves.toBeDefined();
    });

    it('refuse de rétrograder le dernier Super Admin actif vers un autre rôle', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser());
      prisma.user.count.mockResolvedValue(0);
      await expect(service.update('user-1', { roleName: 'EDITEUR' }, 'SUPER_ADMIN')).rejects.toThrow(ForbiddenException);
    });

    it('refuse qu’un compte non Super Admin élève un compte existant au rôle Super Admin', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser({ role: { name: 'EDITEUR' } }));
      await expect(service.update('user-1', { roleName: 'SUPER_ADMIN' }, 'GESTIONNAIRE')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('révoque les sessions actives après un changement de mot de passe', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser({ role: { name: 'EDITEUR' } }));
      prisma.user.update.mockResolvedValue(buildUser());
      await service.update('user-1', { password: 'nouveauMotDePasse1' }, 'SUPER_ADMIN');
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revoked: false },
        data: { revoked: true },
      });
    });

    it('signale un conflit si le nouvel email appartient déjà à un autre compte', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser({ role: { name: 'EDITEUR' } }));
      prisma.user.findFirst.mockResolvedValue({ id: 'autre-compte' });
      await expect(service.update('user-1', { email: 'pris@example.com' }, 'SUPER_ADMIN')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove — verrou du dernier Super Admin actif', () => {
    it('refuse de supprimer le dernier Super Admin actif', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser());
      prisma.user.count.mockResolvedValue(0);
      await expect(service.remove('user-1')).rejects.toThrow(ForbiddenException);
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('autorise la suppression d’un compte qui n’est pas Super Admin', async () => {
      prisma.user.findUnique.mockResolvedValue(buildUser({ role: { name: 'EDITEUR' } }));
      await expect(service.remove('user-1')).resolves.toEqual({ success: true });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });
  });
});
