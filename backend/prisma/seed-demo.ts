import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Données de DÉMONSTRATION uniquement (faux produits, fausse boutique, faux client) — à
 * exécuter en local/dev pour avoir un catalogue à montrer, JAMAIS en production (voir seed.ts,
 * qui ne crée que les rôles/permissions/compte admin/pages de base, seules données légitimes
 * sur un vrai déploiement). Lancer avec `npm run db:seed:demo`.
 */
async function main() {
  console.log('Seed démo : catégories et marques...');
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

  console.log('Seed démo : produits...');
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

  await prisma.product.upsert({
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

  console.log('Seed démo : promotions...');
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

  console.log('Seed démo : boutique...');
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

  console.log('Seed démo : actualité...');
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

  console.log('Seed démo : message de contact et notification...');
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

  console.log('Seed démo terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
