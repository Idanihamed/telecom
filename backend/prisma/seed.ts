import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Ressources et actions couvertes par les phases 1 à 6 (fondations + promotions +
// boutiques + actualités/pages + messages de contact + médias + journal d'activité).
// D'autres ressources (paramètres notamment, §24) seront ajoutées au fil des phases
// suivantes, conformément à la matrice de permissions du cahier des charges v2.0 (§27).
const PERMISSIONS: Array<{ resource: string; action: string }> = [
  { resource: 'categories', action: 'create' },
  { resource: 'categories', action: 'read' },
  { resource: 'categories', action: 'update' },
  { resource: 'categories', action: 'delete' },

  { resource: 'brands', action: 'create' },
  { resource: 'brands', action: 'read' },
  { resource: 'brands', action: 'update' },
  { resource: 'brands', action: 'delete' },

  { resource: 'products', action: 'create' },
  { resource: 'products', action: 'read' },
  { resource: 'products', action: 'update' },
  { resource: 'products', action: 'delete' },
  { resource: 'products', action: 'publish' },

  { resource: 'promotions', action: 'create' },
  { resource: 'promotions', action: 'read' },
  { resource: 'promotions', action: 'update' },
  { resource: 'promotions', action: 'delete' },
  { resource: 'promotions', action: 'activate' },

  { resource: 'boutiques', action: 'create' },
  { resource: 'boutiques', action: 'read' },
  { resource: 'boutiques', action: 'update' },
  { resource: 'boutiques', action: 'delete' },

  { resource: 'articles', action: 'create' },
  { resource: 'articles', action: 'read' },
  { resource: 'articles', action: 'update' },
  { resource: 'articles', action: 'delete' },
  { resource: 'articles', action: 'publish' },

  { resource: 'pages', action: 'create' },
  { resource: 'pages', action: 'read' },
  { resource: 'pages', action: 'update' },
  { resource: 'pages', action: 'delete' },
  { resource: 'pages', action: 'publish' },

  { resource: 'messages', action: 'read' },
  { resource: 'messages', action: 'update' },
  { resource: 'messages', action: 'delete' },

  // Commandes : pas de "create" côté admin, seul le site public en crée (achat invité, voir
  // OrdersController) — un admin ne fait qu'en suivre le traitement, jamais en générer.
  { resource: 'orders', action: 'read' },
  { resource: 'orders', action: 'update' },

  // Utilisée par l'unique endpoint d'upload d'image (§21), commun à tous les modules
  // qui gèrent des images (produits, boutiques, actualités, pages) plutôt que couplée
  // artificiellement à la permission "products:update".
  { resource: 'media', action: 'upload' },

  // Journal d'activité (§28) : lecture seule, réservée au Super Admin (voir README —
  // le cahier des charges ne précise pas explicitement le rôle autorisé, un journal
  // d'audit étant par nature un accès sensible, un choix par défaut restrictif est retenu).
  { resource: 'activity-log', action: 'read' },

  { resource: 'users', action: 'create' },
  { resource: 'users', action: 'read' },
  { resource: 'users', action: 'update' },
  { resource: 'users', action: 'delete' },

  { resource: 'roles', action: 'read' },

  // Paramètres généraux (§24) : réseaux sociaux et WhatsApp, sensibles au même titre que
  // le journal d'activité (visibilité publique immédiate) — réservés au Super Admin.
  { resource: 'settings', action: 'read' },
  { resource: 'settings', action: 'update' },
];

// Correspond à la matrice de permissions §27 du cahier des charges v2.0.
const ROLE_PERMISSIONS: Record<string, Array<{ resource: string; action: string }>> = {
  SUPER_ADMIN: PERMISSIONS, // accès total

  GESTIONNAIRE: [
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'update' },
    { resource: 'products', action: 'delete' },
    { resource: 'products', action: 'publish' },
    { resource: 'categories', action: 'read' },
    { resource: 'brands', action: 'read' },
    { resource: 'promotions', action: 'create' },
    { resource: 'promotions', action: 'read' },
    { resource: 'promotions', action: 'update' },
    { resource: 'promotions', action: 'delete' },
    { resource: 'promotions', action: 'activate' },
    // §27 indique un accès Gestionnaire "selon attribution" (par boutique assignée) plutôt
    // que total. Cette granularité par boutique n'existe pas encore dans le modèle de
    // données (pas de table d'attribution boutique <-> utilisateur) ; en attendant, le
    // Gestionnaire peut consulter et modifier les boutiques mais pas en créer/supprimer.
    // À affiner si une vraie gestion d'attribution est demandée dans une phase suivante.
    { resource: 'boutiques', action: 'read' },
    { resource: 'boutiques', action: 'update' },
    // §27 : "Lecture / Traitement" pour le Gestionnaire (pas de suppression).
    { resource: 'messages', action: 'read' },
    { resource: 'messages', action: 'update' },
    // Rôle naturellement responsable du suivi des commandes (déjà en charge des produits,
    // du stock et des promotions).
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'update' },
    { resource: 'media', action: 'upload' },
  ],

  EDITEUR: [
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'update' },
    { resource: 'products', action: 'publish' },
    { resource: 'categories', action: 'read' },
    { resource: 'brands', action: 'read' },
    { resource: 'boutiques', action: 'read' },
    // §27 : accès total aux Actualités et Pages de contenu pour l'Éditeur.
    { resource: 'articles', action: 'create' },
    { resource: 'articles', action: 'read' },
    { resource: 'articles', action: 'update' },
    { resource: 'articles', action: 'delete' },
    { resource: 'articles', action: 'publish' },
    { resource: 'pages', action: 'create' },
    { resource: 'pages', action: 'read' },
    { resource: 'pages', action: 'update' },
    { resource: 'pages', action: 'delete' },
    { resource: 'pages', action: 'publish' },
    { resource: 'media', action: 'upload' },
  ],
};

async function main() {
  console.log('Seed : création des permissions...');
  const permissionRecords = new Map<string, string>();
  for (const perm of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
    permissionRecords.set(`${perm.resource}:${perm.action}`, record.id);
  }

  console.log('Seed : création des rôles...');
  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `Rôle ${roleName}` },
    });

    for (const perm of perms) {
      const permissionId = permissionRecords.get(`${perm.resource}:${perm.action}`);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }

  console.log('Seed : création du compte Super Administrateur...');
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });

  const email = process.env.SEED_SUPERADMIN_EMAIL ?? 'admin@amzafuturtelecom.com';
  const password = process.env.SEED_SUPERADMIN_PASSWORD ?? 'ChangeMoi123!';
  const name = process.env.SEED_SUPERADMIN_NAME ?? 'Super Admin';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash, roleId: superAdminRole.id },
  });

  // Pages de contenu de base (§22) : des coquilles vides à compléter depuis l'admin, pas des
  // données de démonstration — sans elles, les liens du pied de page (À propos, Livraison...)
  // renverraient une 404 sur un tout premier déploiement.
  console.log('Seed : pages de contenu de base (à compléter depuis l’admin)...');
  const basePages: Array<{ slug: string; title: string; content: string }> = [
    { slug: 'a-propos', title: 'À propos', content: '<p>Contenu à compléter depuis l’administration.</p>' },
    { slug: 'livraison', title: 'Livraison', content: '<p>Contenu à compléter depuis l’administration.</p>' },
    { slug: 'garantie-et-sav', title: 'Garantie et SAV', content: '<p>Contenu à compléter depuis l’administration.</p>' },
    { slug: 'mentions-legales', title: 'Mentions légales', content: '<p>Contenu à compléter depuis l’administration.</p>' },
  ];
  for (const page of basePages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { ...page, status: 'PUBLISHED' },
    });
  }

  console.log('Seed : paramètres généraux (ligne singleton, à compléter depuis l’admin)...');
  await prisma.setting.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  });

  console.log('Seed terminé.');
  console.log(`Connexion admin : ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
