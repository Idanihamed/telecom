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

  console.log('Seed : quelques catégories et marques de démonstration...');
  const smartphones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: { name: 'Smartphones', slug: 'smartphones', sortOrder: 1 },
  });
  const accessoires = await prisma.category.upsert({
    where: { slug: 'accessoires' },
    update: {},
    create: { name: 'Accessoires', slug: 'accessoires', sortOrder: 2 },
  });

  const samsung = await prisma.brand.upsert({
    where: { slug: 'samsung' },
    update: {},
    create: { name: 'Samsung', slug: 'samsung' },
  });

  console.log('Seed : produits de démonstration...');
  const galaxyS25 = await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-s25' },
    update: {},
    create: {
      name: 'Samsung Galaxy S25',
      slug: 'samsung-galaxy-s25',
      sku: 'SGS25-256-NOIR',
      categoryId: smartphones.id,
      brandId: samsung.id,
      shortDescription: 'Le dernier smartphone Samsung, rapide et puissant.',
      description: 'Description complète du Samsung Galaxy S25 à compléter depuis l\'administration.',
      price: 690000,
      // Prix promo "manuel" (§8) : sert de filet de sécurité si aucune promotion
      // campagne n'est active, ou de baseline si une promotion moins intéressante existe.
      promoPrice: 552000,
      stock: 12,
      lowStockThreshold: 5,
      warranty: '12 mois',
      isFeatured: true,
      status: 'PUBLISHED',
      attributes: {
        create: [
          { key: 'RAM', value: '12 Go', sortOrder: 1 },
          { key: 'Stockage', value: '256 Go', sortOrder: 2 },
          { key: 'Écran', value: '6.2 pouces', sortOrder: 3 },
          { key: 'Batterie', value: '4000 mAh', sortOrder: 4 },
          { key: 'Couleur', value: 'Noir', sortOrder: 5 },
        ],
      },
    },
  });

  const chargeur = await prisma.product.upsert({
    where: { slug: 'chargeur-rapide-67w' },
    update: {},
    create: {
      name: 'Chargeur Rapide 67W',
      slug: 'chargeur-rapide-67w',
      sku: 'CHG-67W-USBC',
      categoryId: accessoires.id,
      shortDescription: 'Chargeur ultra-rapide compatible USB-C.',
      description: 'Description complète du chargeur à compléter depuis l\'administration.',
      price: 15000,
      stock: 40,
      lowStockThreshold: 10,
      warranty: '6 mois',
      status: 'PUBLISHED',
      attributes: {
        create: [
          { key: 'Puissance', value: '67 W', sortOrder: 1 },
          { key: 'Port', value: 'USB-C', sortOrder: 2 },
          { key: 'Technologie', value: 'Fast Charge', sortOrder: 3 },
        ],
      },
    },
  });

  console.log('Seed : promotions de démonstration...');
  const now = new Date();
  const inPast = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const inFuture = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // Promotion ciblée sur un produit précis, avec une priorité supérieure au prix
  // promo "manuel" du produit : elle doit l'emporter (§14, règle de priorité).
  const flashSale = await prisma.promotion.upsert({
    where: { id: 'seed-flash-sale-s25' },
    update: {},
    create: {
      id: 'seed-flash-sale-s25',
      name: 'Flash Sale Galaxy S25',
      description: 'Offre limitée sur le Samsung Galaxy S25.',
      type: 'PERCENTAGE',
      value: 25,
      startsAt: inPast(1),
      endsAt: inFuture(3),
      priority: 5,
      adminStatus: 'ACTIVE',
    },
  });
  await prisma.promotionProduct.upsert({
    where: { promotionId_productId: { promotionId: flashSale.id, productId: galaxyS25.id } },
    update: {},
    create: { promotionId: flashSale.id, productId: galaxyS25.id },
  });

  // Promotion sur l'ensemble d'une catégorie, avec bannière (§16).
  const accessoiresPromo = await prisma.promotion.upsert({
    where: { id: 'seed-promo-accessoires' },
    update: {},
    create: {
      id: 'seed-promo-accessoires',
      name: 'Promo Accessoires',
      description: 'Réduction sur toute la catégorie Accessoires.',
      type: 'PERCENTAGE',
      value: 30,
      startsAt: inPast(2),
      endsAt: inFuture(14),
      priority: 1,
      adminStatus: 'ACTIVE',
      bannerTitle: 'GRANDE PROMOTION',
      bannerSubtitle: 'Jusqu\'à -30 % sur nos accessoires',
    },
  });
  await prisma.promotionCategory.upsert({
    where: { promotionId_categoryId: { promotionId: accessoiresPromo.id, categoryId: accessoires.id } },
    update: {},
    create: { promotionId: accessoiresPromo.id, categoryId: accessoires.id },
  });

  // Référencer explicitement pour éviter un avertissement "variable inutilisée".
  void chargeur;

  console.log('Seed : boutique de démonstration...');
  await prisma.boutique.upsert({
    where: { slug: 'amza-futur-telecom-siege' },
    update: {},
    create: {
      name: 'Amza Futur Telecom — Siège',
      slug: 'amza-futur-telecom-siege',
      address: 'Avenue de la République, Abidjan, Côte d\'Ivoire',
      phone: '+225 00 00 00 00',
      whatsapp: '+225 00 00 00 00',
      hours: 'Lun-Sam : 8h30 - 19h00, Dim : fermé',
      description: 'Notre boutique principale : retrait des commandes, accessoires et service après-vente.',
      googleMapsUrl: 'https://maps.google.com/?q=Abidjan',
      isActive: true,
      sortOrder: 1,
    },
  });

  console.log('Seed : actualité de démonstration...');
  await prisma.article.upsert({
    where: { slug: 'ouverture-boutique-siege' },
    update: {},
    create: {
      title: 'Amza Futur Telecom ouvre sa boutique principale à Abidjan',
      slug: 'ouverture-boutique-siege',
      content:
        '<p>Nous sommes heureux d\'annoncer l\'ouverture de notre boutique principale. Venez découvrir nos smartphones et accessoires, avec le conseil de notre équipe.</p>',
      author: 'Équipe Amza',
      category: 'Actualités de l\'entreprise',
      publishedAt: now,
      status: 'PUBLISHED',
      seoTitle: 'Ouverture de la boutique Amza Futur Telecom à Abidjan',
      seoDescription: 'Découvrez notre nouvelle boutique principale et ses services.',
    },
  });

  console.log('Seed : pages de contenu de démonstration...');
  const demoPages: Array<{ slug: string; title: string; content: string }> = [
    {
      slug: 'a-propos',
      title: 'À propos',
      content: '<p>Amza Futur Telecom est votre partenaire technologique de confiance. Contenu à compléter depuis l\'administration.</p>',
    },
    {
      slug: 'livraison',
      title: 'Livraison',
      content: '<p>Informations sur nos modalités de livraison, à compléter depuis l\'administration.</p>',
    },
    {
      slug: 'garantie-et-sav',
      title: 'Garantie et SAV',
      content: '<p>Informations sur la garantie et le service après-vente, à compléter depuis l\'administration.</p>',
    },
    {
      slug: 'mentions-legales',
      title: 'Mentions légales',
      content: '<p>Mentions légales à compléter depuis l\'administration.</p>',
    },
  ];
  for (const page of demoPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { ...page, status: 'PUBLISHED' },
    });
  }

  console.log('Seed : message de contact et notification de démonstration...');
  const demoMessage = await prisma.contactMessage.upsert({
    where: { id: 'seed-message-demo' },
    update: {},
    create: {
      id: 'seed-message-demo',
      reference: 'DEMO0001',
      name: 'Aïcha Koné',
      contact: 'aicha.kone@example.com',
      subject: 'Disponibilité du Samsung Galaxy S25',
      message: 'Bonjour, le Samsung Galaxy S25 noir 256 Go est-il disponible en boutique à Abidjan ?',
      status: 'NOUVEAU',
    },
  });
  // Reproduit ce que déclencherait ContactMessagesService.create() en conditions réelles
  // (§29), pour que le back-office affiche une notification dès le premier lancement.
  await prisma.notification.upsert({
    where: { id: 'seed-notification-demo' },
    update: {},
    create: {
      id: 'seed-notification-demo',
      type: 'CONTACT_MESSAGE',
      message: `Nouveau message de ${demoMessage.name} : ${demoMessage.subject}`,
      link: '/admin/messages',
      isRead: false,
    },
  });

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
