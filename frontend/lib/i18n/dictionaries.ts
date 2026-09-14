export type Locale = 'fr' | 'en';

export const LOCALES: Locale[] = ['fr', 'en'];
export const DEFAULT_LOCALE: Locale = 'fr';

// Traduction de l'interface (menus, boutons, libellés) uniquement — pas du contenu tapé par
// l'admin (noms de produits, descriptions, articles), qui resterait dans sa langue de saisie
// sans un système de traduction par champ, hors scope de cette phase (voir discussion produit).
export interface Dictionary {
  header: {
    nav: { home: string; products: string; boutiques: string; news: string; contact: string };
    whatsapp: string;
    cart: string;
  };
  footer: {
    tagline: string;
    usefulLinks: string;
    links: { about: string; delivery: string; warranty: string; legal: string; boutiques: string; news: string; contact: string };
  };
  common: {
    loading: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    send: string;
    confirm: string;
  };
  theme: { light: string; dark: string; toggle: string };
  language: { label: string };
  adminNav: {
    dashboard: string;
    catalog: string;
    products: string;
    categories: string;
    brands: string;
    promotions: string;
    content: string;
    boutiques: string;
    news: string;
    pages: string;
    communication: string;
    orders: string;
    messages: string;
    system: string;
    activityLog: string;
    accounts: string;
    settings: string;
    notifications: string;
    myAccount: string;
    logout: string;
  };
  adminLogin: {
    title: string;
    email: string;
    password: string;
    submit: string;
    submitting: string;
    error: string;
  };
  stock: { available: string; low: string; out: string; noImage: string };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    discoverProducts: string;
    orderWhatsapp: string;
    activePromotions: string;
    upTo: string;
    viewSaleProducts: string;
    categories: string;
    featuredProducts: string;
    noFeatured: string;
    ourBoutiques: string;
    seeAllBoutiques: string;
    learnMore: string;
    latestNews: string;
    seeAllNews: string;
  };
  products: {
    title: string;
    resultsCount: string;
    noResults: string;
    search: string;
    searchPlaceholder: string;
    category: string;
    allCategories: string;
    brand: string;
    allBrands: string;
    minPrice: string;
    maxPrice: string;
    availableOnly: string;
    onSaleOnly: string;
    sortBy: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortNameAsc: string;
    filter: string;
  };
  productDetail: {
    reference: string;
    category: string;
    warranty: string;
    characteristics: string;
    description: string;
    similarProducts: string;
    orWhatsapp: string;
  };
  addToCart: { add: string; added: string; viewCart: string; outOfStock: string };
  boutiquesPage: { title: string; subtitle: string; none: string; seeOnMap: string };
  newsPage: { title: string; none: string; by: string };
  cart: { title: string; empty: string; viewProducts: string; total: string; checkout: string };
  checkout: {
    title: string;
    name: string;
    contact: string;
    pickupLabel: string;
    deliveryOption: string;
    pickupOption: string;
    deliveryAddress: string;
    note: string;
    optional: string;
    confirm: string;
    sending: string;
    received: string;
    receivedBody: string;
    trackingNumber: string;
    trackingNote: string;
    trackingLink: string;
    error: string;
  };
  orderTracking: {
    title: string;
    subtitle: string;
    trackingNumber: string;
    contact: string;
    contactHint: string;
    verify: string;
    searching: string;
    sentOn: string;
    delivery: string;
    pickup: string;
    searchError: string;
    status: {
      EN_ATTENTE: string;
      CONFIRMEE: string;
      EN_PREPARATION: string;
      EXPEDIEE: string;
      LIVREE: string;
      ANNULEE: string;
    };
  };
  messageTracking: {
    title: string;
    subtitle: string;
    trackingNumber: string;
    contact: string;
    contactHint: string;
    verify: string;
    sentOn: string;
    subject: string;
    reply: string;
    noReply: string;
    searchError: string;
    status: { NOUVEAU: string; LU: string; TRAITE: string };
  };
  contactPage: {
    title: string;
    subtitle: string;
    writeTab: string;
    voiceTab: string;
    contact: string;
    contactHint: string;
    name: string;
    optional: string;
    subject: string;
    message: string;
    voiceNote: string;
    send: string;
    sending: string;
    errorWriteMessage: string;
    errorRecordVoice: string;
    errorGeneric: string;
    successTitle: string;
    trackingNumber: string;
    trackingNote: string;
    trackingLink: string;
    visitorDefaultName: string;
    voiceDefaultSubject: string;
  };
  dashboard: {
    title: string;
    productsTotal: string;
    published: string;
    drafts: string;
    lowStock: string;
    outOfStock: string;
    categories: string;
    promotionsActive: string;
    promotionsScheduled: string;
    boutiques: string;
    newsPublished: string;
    pages: string;
    untreatedMessages: string;
    pendingOrders: string;
  };
  adminCommon: {
    filter: string;
    allStatuses: string;
    status: string;
    actions: string;
    date: string;
    noItems: string;
    active: string;
    inactive: string;
    add: string;
    view: string;
    back: string;
    error: string;
    name: string;
    slug: string;
    loadError: string;
    deleteError: string;
  };
  categoriesPage: { title: string; namePlaceholder: string; confirmDelete: string; image: string };
  brandsPage: { title: string; namePlaceholder: string; confirmDelete: string };
  ordersPage: {
    title: string;
    reference: string;
    client: string;
    total: string;
    noOrders: string;
    receivedOn: string;
    contact: string;
    pickupLabel: string;
    deliveryLabel: string;
    note: string;
    items: string;
    nextStatus: string;
    cancelOrder: string;
    reactivateOrder: string;
    updateError: string;
  };
  messagesPage: {
    title: string;
    noMessages: string;
    confirmDelete: string;
    deleteError: string;
    voiceLabel: string;
    subject: string;
    contact: string;
    voiceMessage: string;
    message: string;
    markTreated: string;
    reopen: string;
    editReply: string;
    reply: string;
    replySentOn: string;
    visibleOnTracking: string;
    contactIfUrgent: string;
    writeReplyHere: string;
    replySaved: string;
    saveReply: string;
    replyError: string;
    messageOf: string;
    trackingRefLabel: string;
    statusUpdateError: string;
    name: string;
  };
  boutiquesPageAdmin: {
    title: string;
    newBoutique: string;
    address: string;
    phone: string;
    noBoutiques: string;
    actionError: string;
    confirmDelete: string;
  };
  journalPage: {
    title: string;
    subtitle: string;
    allResources: string;
    allActions: string;
    from: string;
    to: string;
    user: string;
    action: string;
    detail: string;
    noEntries: string;
    previous: string;
    next: string;
    pageOf: string;
    media: string;
    logins: string;
  };
  usersPage: {
    title: string;
    subtitle: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    creating: string;
    createAccount: string;
    email: string;
    role: string;
    active: string;
    disabled: string;
    resetPassword: string;
    newPasswordPlaceholder: string;
    confirm: string;
    revokesSession: string;
    passwordResetDone: string;
    noAccounts: string;
    loadError: string;
    createError: string;
    updateError: string;
    passwordTooShort: string;
    resetError: string;
    deleteError: string;
    confirmDelete: string;
    superAdmin: string;
    manager: string;
    editor: string;
  };
  settingsPage: {
    title: string;
    subtitle: string;
    loadError: string;
    saveError: string;
    saved: string;
    saving: string;
    save: string;
    heroImagesTitle: string;
    heroImagesHint: string;
    heroImage1Label: string;
    heroImage2Label: string;
  };
  myAccountPage: {
    title: string;
    subtitle: string;
    currentPassword: string;
    newPassword: string;
    newPasswordHint: string;
    save: string;
    saving: string;
    saved: string;
    error: string;
  };
  productForm: {
    name: string;
    sku: string;
    category: string;
    choose: string;
    brand: string;
    none: string;
    shortDescription: string;
    fullDescription: string;
    price: string;
    promoPrice: string;
    stock: string;
    lowStockThreshold: string;
    warranty: string;
    status: string;
    draft: string;
    published: string;
    featured: string;
    images: string;
    mainImage: string;
    setAsMain: string;
    uploading: string;
    uploadError: string;
    characteristics: string;
    addAttribute: string;
    attributeKeyPlaceholder: string;
    attributeValuePlaceholder: string;
    categoryRequired: string;
    saveError: string;
  };
  productsPage: {
    title: string;
    newProduct: string;
    searchPlaceholder: string;
    search: string;
    noProducts: string;
    stockAdjustError: string;
    confirmDelete: string;
    deleteError: string;
    removeStock: string;
    addStock: string;
    unpublish: string;
    publish: string;
    duplicate: string;
    newProductTitle: string;
    editProductTitle: string;
  };
  promotionsPage: {
    title: string;
    newPromotion: string;
    searchPlaceholder: string;
    search: string;
    noPromotions: string;
    actionError: string;
    confirmDelete: string;
    deleteError: string;
    discount: string;
    target: string;
    period: string;
    priority: string;
    productsCount: string;
    categoriesCount: string;
    activate: string;
    deactivate: string;
    backToDraft: string;
    fixedPrice: string;
    statusDraft: string;
    statusScheduled: string;
    statusActive: string;
    statusExpired: string;
    statusDisabled: string;
    newPromotionTitle: string;
    editPromotionTitle: string;
  };
  promotionForm: {
    name: string;
    status: string;
    activeHint: string;
    description: string;
    discountType: string;
    percentage: string;
    fixedAmount: string;
    fixedPriceOption: string;
    value: string;
    priority: string;
    priorityHint: string;
    startDate: string;
    endDate: string;
    conditions: string;
    conditionsPlaceholder: string;
    bannerTitle: string;
    bannerSubtitle: string;
    bannerImage: string;
    targetedCategories: string;
    noCategories: string;
    targetedProducts: string;
    noProducts: string;
    targetHint: string;
    datesRequired: string;
    endAfterStart: string;
  };
  boutiqueForm: {
    name: string;
    address: string;
    phone: string;
    hours: string;
    hoursPlaceholder: string;
    description: string;
    latitude: string;
    longitude: string;
    googleMapsLink: string;
    sortOrder: string;
    activeLabel: string;
    photos: string;
    latLngError: string;
    newBoutiqueTitle: string;
    editBoutiqueTitle: string;
  };
  newsPageAdmin: {
    title: string;
    newArticle: string;
    searchPlaceholder: string;
    search: string;
    noArticles: string;
    confirmDelete: string;
    deleteError: string;
    titleColumn: string;
    category: string;
    newArticleTitle: string;
    editArticleTitle: string;
  };
  articleForm: {
    title: string;
    author: string;
    category: string;
    date: string;
    coverImage: string;
    content: string;
    contentHint: string;
    contentRequired: string;
    seoTitle: string;
    seoDescription: string;
    status: string;
  };
  pagesPageAdmin: {
    title: string;
    newPage: string;
    subtitle: string;
    noPages: string;
    confirmDelete: string;
    deleteError: string;
    titleColumn: string;
    updatedAt: string;
    newPageTitle: string;
    editPageTitle: string;
  };
  pageForm: {
    title: string;
    publicUrl: string;
    illustrationImage: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  fr: {
    header: {
      nav: { home: 'Accueil', products: 'Produits', boutiques: 'Boutiques', news: 'Actualités', contact: 'Contact' },
      whatsapp: 'WhatsApp',
      cart: 'Panier',
    },
    footer: {
      tagline: 'Votre technologie. Votre futur.',
      usefulLinks: 'Liens utiles',
      links: {
        about: 'À propos',
        delivery: 'Livraison',
        warranty: 'Garantie et SAV',
        legal: 'Mentions légales',
        boutiques: 'Nos boutiques',
        news: 'Actualités',
        contact: 'Contact',
      },
    },
    common: {
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      send: 'Envoyer',
      confirm: 'Confirmer',
    },
    theme: { light: 'Clair', dark: 'Sombre', toggle: 'Changer de thème' },
    language: { label: 'Langue' },
    adminNav: {
      dashboard: 'Tableau de bord',
      catalog: 'Catalogue',
      products: 'Produits',
      categories: 'Catégories',
      brands: 'Marques',
      promotions: 'Promotions',
      content: 'Contenu',
      boutiques: 'Boutiques',
      news: 'Actualités',
      pages: 'Pages',
      communication: 'Communication',
      orders: 'Commandes',
      messages: 'Messages',
      system: 'Système',
      activityLog: 'Journal',
      accounts: 'Comptes',
      settings: 'Paramètres',
      notifications: 'Notifications',
      myAccount: 'Mon compte',
      logout: 'Déconnexion',
    },
    adminLogin: {
      title: 'Espace administration',
      email: 'Email',
      password: 'Mot de passe',
      submit: 'Se connecter',
      submitting: 'Connexion...',
      error: 'Erreur de connexion.',
    },
    stock: { available: 'Disponible', low: 'Stock faible', out: 'Rupture', noImage: "Pas d'image" },
    home: {
      heroTitle: 'Votre technologie. Votre futur.',
      heroSubtitle: 'Découvrez les smartphones, accessoires et audio sélectionnés par Amza Futur Telecom.',
      discoverProducts: 'Découvrir nos produits',
      orderWhatsapp: 'Commander sur WhatsApp',
      activePromotions: 'Promotions en cours',
      upTo: "Jusqu'à",
      viewSaleProducts: 'Voir les produits en promotion',
      categories: 'Catégories',
      featuredProducts: 'Produits vedettes',
      noFeatured: 'Aucun produit vedette pour le moment.',
      ourBoutiques: 'Nos boutiques',
      seeAllBoutiques: 'Voir toutes les boutiques →',
      learnMore: 'En savoir plus →',
      latestNews: 'Dernières actualités',
      seeAllNews: 'Toutes les actualités →',
    },
    products: {
      title: 'Nos produits',
      resultsCount: 'résultat(s)',
      noResults: 'Aucun produit ne correspond à votre recherche.',
      search: 'Recherche',
      searchPlaceholder: 'Nom, marque, référence...',
      category: 'Catégorie',
      allCategories: 'Toutes',
      brand: 'Marque',
      allBrands: 'Toutes',
      minPrice: 'Prix min',
      maxPrice: 'Prix max',
      availableOnly: 'Disponible uniquement',
      onSaleOnly: 'En promotion',
      sortBy: 'Trier par',
      sortNewest: 'Plus récents',
      sortPriceAsc: 'Prix croissant',
      sortPriceDesc: 'Prix décroissant',
      sortNameAsc: 'Nom (A-Z)',
      filter: 'Filtrer',
    },
    productDetail: {
      reference: 'Référence',
      category: 'Catégorie',
      warranty: 'Garantie',
      characteristics: 'Caractéristiques',
      description: 'Description',
      similarProducts: 'Produits similaires',
      orWhatsapp: 'ou commander directement sur WhatsApp →',
    },
    addToCart: { add: 'Ajouter au panier', added: 'Ajouté ✓', viewCart: 'voir le panier', outOfStock: 'Ce produit est actuellement en rupture de stock.' },
    boutiquesPage: {
      title: 'Nos boutiques',
      subtitle: 'Retrouvez-nous dans nos points de vente.',
      none: "Aucune boutique n'est disponible pour le moment.",
      seeOnMap: 'Voir sur la carte',
    },
    newsPage: { title: 'Actualités', none: 'Aucune actualité publiée pour le moment.', by: 'Par' },
    cart: {
      title: 'Panier',
      empty: 'Ton panier est vide.',
      viewProducts: 'Voir les produits',
      total: 'Total',
      checkout: 'Passer la commande',
    },
    checkout: {
      title: 'Finaliser la commande',
      name: 'Nom',
      contact: 'Téléphone ou email',
      pickupLabel: 'Retrait en boutique',
      deliveryOption: 'Livraison à une adresse plutôt qu’un retrait en boutique',
      pickupOption: 'Retrait —',
      deliveryAddress: 'Adresse de livraison',
      note: 'Note',
      optional: 'optionnel',
      confirm: 'Confirmer la commande',
      sending: 'Envoi...',
      received: 'Commande bien reçue par Amza Futur Telecom !',
      receivedBody: 'Votre numéro de suivi',
      trackingNumber: 'Numéro de suivi',
      trackingNote: 'Note-le : il te permet de suivre l’avancement de ta commande sur',
      trackingLink: 'la page de suivi',
      error: "Erreur lors de l'envoi de la commande.",
    },
    orderTracking: {
      title: 'Suivre ma commande',
      subtitle: 'Retrouve le statut de ta commande à partir du numéro de suivi reçu après l’envoi.',
      trackingNumber: 'Numéro de suivi',
      contact: 'Téléphone ou email',
      contactHint: 'celui saisi à la commande',
      verify: 'Vérifier',
      searching: 'Recherche...',
      sentOn: 'Envoyée le',
      delivery: 'Livraison',
      pickup: 'Retrait en boutique',
      searchError: 'Recherche impossible.',
      status: {
        EN_ATTENTE: 'En attente de confirmation',
        CONFIRMEE: 'Confirmée',
        EN_PREPARATION: 'En préparation',
        EXPEDIEE: 'Expédiée',
        LIVREE: 'Livrée',
        ANNULEE: 'Annulée',
      },
    },
    messageTracking: {
      title: 'Suivre ma demande',
      subtitle: 'Retrouve le statut de ton message envoyé depuis la page Contact et la réponse d’Amza Futur Telecom.',
      trackingNumber: 'Numéro de suivi',
      contact: 'Téléphone ou email',
      contactHint: 'celui saisi à l’envoi',
      verify: 'Vérifier',
      sentOn: 'Envoyé le',
      subject: 'Sujet',
      reply: 'Réponse d’Amza Futur Telecom',
      noReply: 'Pas encore de réponse — nous reviendrons vers toi dès que possible.',
      searchError: 'Recherche impossible.',
      status: { NOUVEAU: 'Reçu', LU: 'En cours de traitement', TRAITE: 'Traité' },
    },
    contactPage: {
      title: 'Contactez-nous',
      subtitle:
        'Une question sur un produit, une commande ou nos boutiques ? Écrivez-nous ou envoyez un message vocal, nous vous répondrons dans les meilleurs délais.',
      writeTab: '✍️ Écrire',
      voiceTab: '🎤 Vocal',
      contact: 'Téléphone ou email',
      contactHint: "pour qu'on puisse te répondre",
      name: 'Nom',
      optional: 'optionnel',
      subject: 'Sujet',
      message: 'Message',
      voiceNote:
        'Une fois l’enregistrement terminé, clique sur « Envoyer » ci-dessous — il n’y a pas de bouton séparé pour le vocal.',
      send: 'Envoyer',
      sending: 'Envoi...',
      errorWriteMessage: 'Écris ton message.',
      errorRecordVoice: 'Enregistre ton message vocal avant d’envoyer.',
      errorGeneric: "Erreur lors de l'envoi.",
      successTitle: 'Message bien reçu par Amza Futur Telecom. Nous vous répondrons au {contact} dans les meilleurs délais.',
      trackingNumber: 'Votre numéro de suivi',
      trackingNote: 'Note-le : il te permet de vérifier plus tard si Amza a répondu, sur',
      trackingLink: 'la page de suivi',
      visitorDefaultName: 'Visiteur',
      voiceDefaultSubject: 'Message vocal',
    },
    dashboard: {
      title: 'Tableau de bord',
      productsTotal: 'Produits (total)',
      published: 'Publiés',
      drafts: 'Brouillons',
      lowStock: 'Stock faible',
      outOfStock: 'Ruptures',
      categories: 'Catégories',
      promotionsActive: 'Promotions actives',
      promotionsScheduled: 'Promotions programmées',
      boutiques: 'Boutiques',
      newsPublished: 'Actualités publiées',
      pages: 'Pages de contenu',
      untreatedMessages: 'Messages non traités',
      pendingOrders: 'Commandes en cours',
    },
    adminCommon: {
      filter: 'Filtrer',
      allStatuses: 'Tous les statuts',
      status: 'Statut',
      actions: 'Actions',
      date: 'Date',
      noItems: 'Aucun élément.',
      active: 'Actif',
      inactive: 'Inactif',
      add: 'Ajouter',
      view: 'Voir',
      back: 'Retour à la liste',
      error: 'Une erreur est survenue.',
      name: 'Nom',
      slug: 'Slug',
      loadError: 'Erreur de chargement.',
      deleteError: 'Suppression impossible.',
    },
    categoriesPage: {
      title: 'Catégories',
      namePlaceholder: 'Nom de la catégorie',
      confirmDelete: 'Supprimer cette catégorie ?',
      image: 'Image',
    },
    brandsPage: {
      title: 'Marques',
      namePlaceholder: 'Nom de la marque',
      confirmDelete: 'Supprimer cette marque ?',
    },
    ordersPage: {
      title: 'Commandes',
      reference: 'Référence',
      client: 'Client',
      total: 'Total',
      noOrders: 'Aucune commande.',
      receivedOn: 'Reçue le',
      contact: 'Contact',
      pickupLabel: 'Retrait en boutique',
      deliveryLabel: 'Adresse de livraison',
      note: 'Note',
      items: 'Articles',
      nextStatus: 'Passer à',
      cancelOrder: 'Annuler la commande',
      reactivateOrder: 'Réactiver (remettre en attente)',
      updateError: 'Mise à jour impossible.',
    },
    messagesPage: {
      title: 'Messages de contact',
      noMessages: 'Aucun message.',
      confirmDelete: 'Supprimer ce message ?',
      deleteError: 'Suppression impossible.',
      voiceLabel: 'Message vocal',
      subject: 'Sujet',
      contact: 'Contact (téléphone ou email)',
      voiceMessage: 'Message vocal',
      message: 'Message',
      markTreated: 'Marquer comme traité',
      reopen: 'Rouvrir (remettre à "Lu")',
      editReply: 'Modifier la réponse',
      reply: 'Répondre',
      replySentOn: 'Réponse envoyée',
      visibleOnTracking: 'visible par le visiteur sur /suivi',
      contactIfUrgent: "Le visiteur n'a pas de messagerie intégrée : cette réponse s'affiche sur la page /suivi quand il consulte sa demande avec son numéro de suivi. Pense à le contacter aussi par {contact} si c'est urgent.",
      writeReplyHere: 'Écris ta réponse ici...',
      replySaved: 'Réponse enregistrée.',
      saveReply: 'Enregistrer la réponse',
      replyError: 'Envoi de la réponse impossible.',
      messageOf: 'Message de',
      trackingRefLabel: 'Numéro de suivi communiqué au visiteur',
      statusUpdateError: 'Mise à jour impossible.',
      name: 'Nom',
    },
    boutiquesPageAdmin: {
      title: 'Boutiques',
      newBoutique: '+ Nouvelle boutique',
      address: 'Adresse',
      phone: 'Téléphone',
      noBoutiques: 'Aucune boutique.',
      actionError: 'Action impossible.',
      confirmDelete: 'Supprimer cette boutique ?',
    },
    journalPage: {
      title: "Journal d'activité",
      subtitle:
        'Historique des actions effectuées depuis le back-office (créations, modifications, suppressions, publications, connexions...). Réservé au Super Admin.',
      allResources: 'Toutes les ressources',
      allActions: 'Toutes les actions',
      from: 'Depuis le',
      to: "Jusqu'au",
      user: 'Utilisateur',
      action: 'Action',
      detail: 'Détail',
      noEntries: 'Aucune entrée pour ces filtres.',
      previous: 'Précédent',
      next: 'Suivant',
      pageOf: 'Page {page} / {total}',
      media: 'Médias',
      logins: 'Connexions',
    },
    usersPage: {
      title: 'Comptes administrateurs',
      subtitle: 'Créer, modifier ou désactiver les comptes du back-office. Réservé au Super Admin (§3.2, §27).',
      namePlaceholder: 'Nom',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Mot de passe (10 car. min.)',
      creating: 'Création...',
      createAccount: 'Créer le compte',
      email: 'Email',
      role: 'Rôle',
      active: 'Actif',
      disabled: 'Désactivé',
      resetPassword: 'Réinitialiser mdp',
      newPasswordPlaceholder: 'Nouveau mot de passe (10 car. min.)',
      confirm: 'Confirmer',
      revokesSession: 'Déconnecte immédiatement ce compte de toute session ouverte.',
      passwordResetDone: 'Mot de passe réinitialisé.',
      noAccounts: 'Aucun compte.',
      loadError: 'Erreur de chargement.',
      createError: 'Erreur lors de la création du compte.',
      updateError: 'Modification impossible.',
      passwordTooShort: 'Le mot de passe doit contenir au moins 10 caractères.',
      resetError: 'Réinitialisation impossible.',
      deleteError: 'Suppression impossible.',
      confirmDelete: 'Supprimer ce compte administrateur ? Cette action est définitive.',
      superAdmin: 'Super Admin',
      manager: 'Gestionnaire',
      editor: 'Éditeur',
    },
    settingsPage: {
      title: 'Paramètres généraux',
      subtitle:
        'Réseaux sociaux et WhatsApp affichés dans le pied de page du site public. Laisse un champ vide pour masquer l’icône correspondante.',
      loadError: 'Erreur de chargement.',
      saveError: 'Erreur lors de l’enregistrement.',
      saved: 'Paramètres enregistrés.',
      saving: 'Enregistrement...',
      save: 'Enregistrer',
      heroImagesTitle: 'Visuels de la page d’accueil',
      heroImagesHint: 'Les deux images affichées dans le bandeau d’accueil. Remplace-les à tout moment par tes propres visuels.',
      heroImage1Label: 'Image 1',
      heroImage2Label: 'Image 2',
    },
    myAccountPage: {
      title: 'Mon compte',
      subtitle: 'Changer ton propre mot de passe. Toutes tes autres sessions seront déconnectées.',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      newPasswordHint: 'Au moins 10 caractères.',
      save: 'Changer le mot de passe',
      saving: 'Enregistrement...',
      saved: 'Mot de passe changé.',
      error: 'Erreur lors du changement de mot de passe.',
    },
    productForm: {
      name: 'Nom du produit',
      sku: 'SKU / référence',
      category: 'Catégorie',
      choose: 'Choisir...',
      brand: 'Marque',
      none: 'Aucune',
      shortDescription: 'Description courte',
      fullDescription: 'Description complète',
      price: 'Prix (FCFA)',
      promoPrice: 'Prix promo (FCFA)',
      stock: 'Stock',
      lowStockThreshold: 'Seuil stock faible',
      warranty: 'Garantie',
      status: 'Statut',
      draft: 'Brouillon',
      published: 'Publié',
      featured: 'Produit vedette',
      images: 'Images',
      mainImage: 'Principale',
      setAsMain: 'Définir principale',
      uploading: 'Téléversement...',
      uploadError: "Échec de l'upload de l'image.",
      characteristics: 'Caractéristiques',
      addAttribute: '+ Ajouter',
      attributeKeyPlaceholder: 'Clé (ex. RAM)',
      attributeValuePlaceholder: 'Valeur (ex. 12 Go)',
      categoryRequired: 'Veuillez choisir une catégorie.',
      saveError: 'Erreur lors de l’enregistrement.',
    },
    productsPage: {
      title: 'Produits',
      newProduct: '+ Nouveau produit',
      searchPlaceholder: 'Rechercher (nom, SKU)...',
      search: 'Rechercher',
      noProducts: 'Aucun produit.',
      stockAdjustError: 'Ajustement du stock impossible.',
      confirmDelete: 'Supprimer ce produit ?',
      deleteError: 'Suppression impossible.',
      removeStock: 'Retirer une unité de stock',
      addStock: 'Ajouter une unité de stock',
      unpublish: 'Dépublier',
      publish: 'Publier',
      duplicate: 'Dupliquer',
      newProductTitle: 'Nouveau produit',
      editProductTitle: 'Modifier « {name} »',
    },
    promotionsPage: {
      title: 'Promotions',
      newPromotion: '+ Nouvelle promotion',
      searchPlaceholder: 'Rechercher (nom)...',
      search: 'Rechercher',
      noPromotions: 'Aucune promotion.',
      actionError: 'Action impossible.',
      confirmDelete: 'Supprimer cette promotion ?',
      deleteError: 'Suppression impossible.',
      discount: 'Réduction',
      target: 'Cible',
      period: 'Période',
      priority: 'Priorité',
      productsCount: 'produit(s)',
      categoriesCount: 'catégorie(s)',
      activate: 'Activer',
      deactivate: 'Désactiver',
      backToDraft: 'Repasser en brouillon',
      fixedPrice: 'Prix fixe',
      statusDraft: 'Brouillon',
      statusScheduled: 'Programmée',
      statusActive: 'Active',
      statusExpired: 'Expirée',
      statusDisabled: 'Désactivée',
      newPromotionTitle: 'Nouvelle promotion',
      editPromotionTitle: 'Modifier « {name} »',
    },
    promotionForm: {
      name: 'Nom de la promotion',
      status: 'Statut',
      activeHint:
        '« Active » ne veut pas dire visible tout de suite : la promotion ne s’affiche que pendant sa période (§14 du cahier des charges).',
      description: 'Description (usage interne)',
      discountType: 'Type de réduction',
      percentage: 'Pourcentage (%)',
      fixedAmount: 'Montant fixe (FCFA)',
      fixedPriceOption: 'Prix fixe (FCFA)',
      value: 'Valeur',
      priority: 'Priorité',
      priorityHint: 'En cas de plusieurs promotions applicables à un produit, la priorité la plus élevée l’emporte.',
      startDate: 'Début',
      endDate: 'Fin',
      conditions: 'Conditions (optionnel, affiché aux clients)',
      conditionsPlaceholder: 'Ex. Dans la limite des stocks disponibles',
      bannerTitle: 'Titre de la bannière (accueil)',
      bannerSubtitle: 'Sous-titre de la bannière',
      bannerImage: 'Image de la bannière (accueil)',
      targetedCategories: 'Catégories ciblées',
      noCategories: 'Aucune catégorie.',
      targetedProducts: 'Produits ciblés',
      noProducts: 'Aucun produit.',
      targetHint:
        'Une promotion peut cibler des catégories entières et/ou des produits précis (§13). Si aucun n’est sélectionné, la promotion ne s’applique à aucun produit.',
      datesRequired: 'Veuillez indiquer une date de début et une date de fin.',
      endAfterStart: 'La date de fin doit être postérieure à la date de début.',
    },
    boutiqueForm: {
      name: 'Nom de la boutique',
      address: 'Adresse',
      phone: 'Téléphone',
      hours: 'Horaires',
      hoursPlaceholder: 'Ex. Lun-Sam : 8h30 - 19h00',
      description: 'Description',
      latitude: 'Latitude',
      longitude: 'Longitude',
      googleMapsLink: 'Lien Google Maps',
      sortOrder: "Ordre d'affichage",
      activeLabel: 'Boutique active (visible sur le site public)',
      photos: 'Photos',
      latLngError: 'Renseigner la latitude ET la longitude, ou aucune des deux.',
      newBoutiqueTitle: 'Nouvelle boutique',
      editBoutiqueTitle: 'Modifier « {name} »',
    },
    newsPageAdmin: {
      title: 'Actualités',
      newArticle: '+ Nouvelle actualité',
      searchPlaceholder: 'Rechercher (titre)...',
      search: 'Rechercher',
      noArticles: 'Aucune actualité.',
      confirmDelete: 'Supprimer cette actualité ?',
      deleteError: 'Suppression impossible.',
      titleColumn: 'Titre',
      category: 'Catégorie',
      newArticleTitle: 'Nouvelle actualité',
      editArticleTitle: 'Modifier « {title} »',
    },
    articleForm: {
      title: 'Titre',
      author: 'Auteur',
      category: 'Catégorie',
      date: 'Date',
      coverImage: 'Image de couverture',
      content: 'Contenu',
      contentHint: 'Mise en forme (titres, gras, listes, liens...) affichée telle quelle sur le site public.',
      contentRequired: 'Le contenu ne peut pas être vide.',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      status: 'Statut',
    },
    pagesPageAdmin: {
      title: 'Pages de contenu',
      newPage: '+ Nouvelle page',
      subtitle:
        'À propos, Livraison, Garantie et SAV, Mentions légales, CGU, Politique de confidentialité... chaque page publiée est accessible via sa propre URL (ex. /a-propos), sans intervention d’un développeur (§22).',
      noPages: 'Aucune page.',
      confirmDelete: 'Supprimer cette page ?',
      deleteError: 'Suppression impossible.',
      titleColumn: 'Titre',
      updatedAt: 'Mise à jour',
      newPageTitle: 'Nouvelle page',
      editPageTitle: 'Modifier « {title} »',
    },
    pageForm: {
      title: 'Titre',
      publicUrl: 'URL publique : /{slug}',
      illustrationImage: "Image d'illustration",
    },
  },
  en: {
    header: {
      nav: { home: 'Home', products: 'Products', boutiques: 'Stores', news: 'News', contact: 'Contact' },
      whatsapp: 'WhatsApp',
      cart: 'Cart',
    },
    footer: {
      tagline: 'Your technology. Your future.',
      usefulLinks: 'Useful links',
      links: {
        about: 'About',
        delivery: 'Delivery',
        warranty: 'Warranty & support',
        legal: 'Legal notice',
        boutiques: 'Our stores',
        news: 'News',
        contact: 'Contact',
      },
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      send: 'Send',
      confirm: 'Confirm',
    },
    theme: { light: 'Light', dark: 'Dark', toggle: 'Toggle theme' },
    language: { label: 'Language' },
    adminNav: {
      dashboard: 'Dashboard',
      catalog: 'Catalog',
      products: 'Products',
      categories: 'Categories',
      brands: 'Brands',
      promotions: 'Promotions',
      content: 'Content',
      boutiques: 'Stores',
      news: 'News',
      pages: 'Pages',
      communication: 'Communication',
      orders: 'Orders',
      messages: 'Messages',
      system: 'System',
      activityLog: 'Activity log',
      accounts: 'Accounts',
      settings: 'Settings',
      notifications: 'Notifications',
      myAccount: 'My account',
      logout: 'Log out',
    },
    adminLogin: {
      title: 'Admin area',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in',
      submitting: 'Signing in...',
      error: 'Sign-in error.',
    },
    stock: { available: 'In stock', low: 'Low stock', out: 'Out of stock', noImage: 'No image' },
    home: {
      heroTitle: 'Your technology. Your future.',
      heroSubtitle: 'Discover the smartphones, accessories and audio gear selected by Amza Futur Telecom.',
      discoverProducts: 'Discover our products',
      orderWhatsapp: 'Order on WhatsApp',
      activePromotions: 'Current promotions',
      upTo: 'Up to',
      viewSaleProducts: 'View products on sale',
      categories: 'Categories',
      featuredProducts: 'Featured products',
      noFeatured: 'No featured product at the moment.',
      ourBoutiques: 'Our stores',
      seeAllBoutiques: 'See all stores →',
      learnMore: 'Learn more →',
      latestNews: 'Latest news',
      seeAllNews: 'All news →',
    },
    products: {
      title: 'Our products',
      resultsCount: 'result(s)',
      noResults: 'No product matches your search.',
      search: 'Search',
      searchPlaceholder: 'Name, brand, reference...',
      category: 'Category',
      allCategories: 'All',
      brand: 'Brand',
      allBrands: 'All',
      minPrice: 'Min price',
      maxPrice: 'Max price',
      availableOnly: 'In stock only',
      onSaleOnly: 'On sale',
      sortBy: 'Sort by',
      sortNewest: 'Newest',
      sortPriceAsc: 'Price: low to high',
      sortPriceDesc: 'Price: high to low',
      sortNameAsc: 'Name (A-Z)',
      filter: 'Filter',
    },
    productDetail: {
      reference: 'Reference',
      category: 'Category',
      warranty: 'Warranty',
      characteristics: 'Specifications',
      description: 'Description',
      similarProducts: 'Similar products',
      orWhatsapp: 'or order directly on WhatsApp →',
    },
    addToCart: { add: 'Add to cart', added: 'Added ✓', viewCart: 'view cart', outOfStock: 'This product is currently out of stock.' },
    boutiquesPage: {
      title: 'Our stores',
      subtitle: 'Find us at our points of sale.',
      none: 'No store is available at the moment.',
      seeOnMap: 'View on map',
    },
    newsPage: { title: 'News', none: 'No article published at the moment.', by: 'By' },
    cart: {
      title: 'Cart',
      empty: 'Your cart is empty.',
      viewProducts: 'View products',
      total: 'Total',
      checkout: 'Checkout',
    },
    checkout: {
      title: 'Complete your order',
      name: 'Name',
      contact: 'Phone or email',
      pickupLabel: 'In-store pickup',
      deliveryOption: 'Delivery to an address instead of an in-store pickup',
      pickupOption: 'Pickup —',
      deliveryAddress: 'Delivery address',
      note: 'Note',
      optional: 'optional',
      confirm: 'Confirm order',
      sending: 'Sending...',
      received: 'Order received by Amza Futur Telecom!',
      receivedBody: 'Your tracking number',
      trackingNumber: 'Tracking number',
      trackingNote: 'Write it down: it lets you follow your order on',
      trackingLink: 'the tracking page',
      error: 'Error while sending the order.',
    },
    orderTracking: {
      title: 'Track my order',
      subtitle: 'Find the status of your order using the tracking number received after checkout.',
      trackingNumber: 'Tracking number',
      contact: 'Phone or email',
      contactHint: 'the one entered at checkout',
      verify: 'Check',
      searching: 'Searching...',
      sentOn: 'Placed on',
      delivery: 'Delivery',
      pickup: 'In-store pickup',
      searchError: 'Search failed.',
      status: {
        EN_ATTENTE: 'Awaiting confirmation',
        CONFIRMEE: 'Confirmed',
        EN_PREPARATION: 'Being prepared',
        EXPEDIEE: 'Shipped',
        LIVREE: 'Delivered',
        ANNULEE: 'Cancelled',
      },
    },
    messageTracking: {
      title: 'Track my request',
      subtitle: 'Find the status of your message sent from the Contact page and Amza Futur Telecom’s reply.',
      trackingNumber: 'Tracking number',
      contact: 'Phone or email',
      contactHint: 'the one entered when sending',
      verify: 'Check',
      sentOn: 'Sent on',
      subject: 'Subject',
      reply: 'Reply from Amza Futur Telecom',
      noReply: 'No reply yet — we will get back to you as soon as possible.',
      searchError: 'Search failed.',
      status: { NOUVEAU: 'Received', LU: 'Being processed', TRAITE: 'Resolved' },
    },
    contactPage: {
      title: 'Contact us',
      subtitle:
        'A question about a product, an order or our stores? Write to us or send a voice message, we will reply as soon as possible.',
      writeTab: '✍️ Write',
      voiceTab: '🎤 Voice',
      contact: 'Phone or email',
      contactHint: 'so we can reply to you',
      name: 'Name',
      optional: 'optional',
      subject: 'Subject',
      message: 'Message',
      voiceNote: 'Once the recording is done, click "Send" below — there is no separate button for the voice message.',
      send: 'Send',
      sending: 'Sending...',
      errorWriteMessage: 'Write your message.',
      errorRecordVoice: 'Record your voice message before sending.',
      errorGeneric: 'Error while sending.',
      successTitle: 'Message received by Amza Futur Telecom. We will reply to you at {contact} as soon as possible.',
      trackingNumber: 'Your tracking number',
      trackingNote: 'Write it down: it lets you check later whether Amza has replied, on',
      trackingLink: 'the tracking page',
      visitorDefaultName: 'Visitor',
      voiceDefaultSubject: 'Voice message',
    },
    dashboard: {
      title: 'Dashboard',
      productsTotal: 'Products (total)',
      published: 'Published',
      drafts: 'Drafts',
      lowStock: 'Low stock',
      outOfStock: 'Out of stock',
      categories: 'Categories',
      promotionsActive: 'Active promotions',
      promotionsScheduled: 'Scheduled promotions',
      boutiques: 'Stores',
      newsPublished: 'Published news',
      pages: 'Content pages',
      untreatedMessages: 'Untreated messages',
      pendingOrders: 'Pending orders',
    },
    adminCommon: {
      filter: 'Filter',
      allStatuses: 'All statuses',
      status: 'Status',
      actions: 'Actions',
      date: 'Date',
      noItems: 'No items.',
      active: 'Active',
      inactive: 'Inactive',
      add: 'Add',
      view: 'View',
      back: 'Back to list',
      error: 'An error occurred.',
      name: 'Name',
      slug: 'Slug',
      loadError: 'Loading error.',
      deleteError: 'Deletion failed.',
    },
    categoriesPage: {
      title: 'Categories',
      namePlaceholder: 'Category name',
      confirmDelete: 'Delete this category?',
      image: 'Image',
    },
    brandsPage: {
      title: 'Brands',
      namePlaceholder: 'Brand name',
      confirmDelete: 'Delete this brand?',
    },
    ordersPage: {
      title: 'Orders',
      reference: 'Reference',
      client: 'Customer',
      total: 'Total',
      noOrders: 'No orders.',
      receivedOn: 'Received on',
      contact: 'Contact',
      pickupLabel: 'In-store pickup',
      deliveryLabel: 'Delivery address',
      note: 'Note',
      items: 'Items',
      nextStatus: 'Move to',
      cancelOrder: 'Cancel order',
      reactivateOrder: 'Reactivate (set back to pending)',
      updateError: 'Update failed.',
    },
    messagesPage: {
      title: 'Contact messages',
      noMessages: 'No messages.',
      confirmDelete: 'Delete this message?',
      deleteError: 'Deletion failed.',
      voiceLabel: 'Voice message',
      subject: 'Subject',
      contact: 'Contact (phone or email)',
      voiceMessage: 'Voice message',
      message: 'Message',
      markTreated: 'Mark as resolved',
      reopen: 'Reopen (set back to "Read")',
      editReply: 'Edit reply',
      reply: 'Reply',
      replySentOn: 'Reply sent',
      visibleOnTracking: 'visible to the visitor on /suivi',
      contactIfUrgent: "The visitor has no built-in messaging: this reply shows on the /suivi page when they check their request with their tracking number. Consider also contacting them at {contact} if it's urgent.",
      writeReplyHere: 'Write your reply here...',
      replySaved: 'Reply saved.',
      saveReply: 'Save reply',
      replyError: 'Failed to send the reply.',
      messageOf: 'Message from',
      trackingRefLabel: 'Tracking number given to the visitor',
      statusUpdateError: 'Update failed.',
      name: 'Name',
    },
    boutiquesPageAdmin: {
      title: 'Stores',
      newBoutique: '+ New store',
      address: 'Address',
      phone: 'Phone',
      noBoutiques: 'No stores.',
      actionError: 'Action failed.',
      confirmDelete: 'Delete this store?',
    },
    journalPage: {
      title: 'Activity log',
      subtitle:
        'History of actions performed from the back-office (creations, updates, deletions, publishing, logins...). Reserved to the Super Admin.',
      allResources: 'All resources',
      allActions: 'All actions',
      from: 'From',
      to: 'To',
      user: 'User',
      action: 'Action',
      detail: 'Detail',
      noEntries: 'No entries for these filters.',
      previous: 'Previous',
      next: 'Next',
      pageOf: 'Page {page} / {total}',
      media: 'Media',
      logins: 'Logins',
    },
    usersPage: {
      title: 'Admin accounts',
      subtitle: 'Create, edit or disable back-office accounts. Reserved to the Super Admin (§3.2, §27).',
      namePlaceholder: 'Name',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Password (10 char. min.)',
      creating: 'Creating...',
      createAccount: 'Create account',
      email: 'Email',
      role: 'Role',
      active: 'Active',
      disabled: 'Disabled',
      resetPassword: 'Reset password',
      newPasswordPlaceholder: 'New password (10 char. min.)',
      confirm: 'Confirm',
      revokesSession: 'Immediately signs this account out of any open session.',
      passwordResetDone: 'Password reset.',
      noAccounts: 'No accounts.',
      loadError: 'Loading error.',
      createError: 'Error while creating the account.',
      updateError: 'Update failed.',
      passwordTooShort: 'The password must be at least 10 characters long.',
      resetError: 'Reset failed.',
      deleteError: 'Deletion failed.',
      confirmDelete: 'Delete this admin account? This action is permanent.',
      superAdmin: 'Super Admin',
      manager: 'Manager',
      editor: 'Editor',
    },
    settingsPage: {
      title: 'General settings',
      subtitle:
        'Social networks and WhatsApp displayed in the public site footer. Leave a field empty to hide the corresponding icon.',
      loadError: 'Loading error.',
      saveError: 'Error while saving.',
      saved: 'Settings saved.',
      saving: 'Saving...',
      save: 'Save',
      heroImagesTitle: 'Homepage visuals',
      heroImagesHint: 'The two images shown in the homepage banner. Replace them any time with your own visuals.',
      heroImage1Label: 'Image 1',
      heroImage2Label: 'Image 2',
    },
    myAccountPage: {
      title: 'My account',
      subtitle: 'Change your own password. All your other sessions will be signed out.',
      currentPassword: 'Current password',
      newPassword: 'New password',
      newPasswordHint: 'At least 10 characters.',
      save: 'Change password',
      saving: 'Saving...',
      saved: 'Password changed.',
      error: 'Error while changing the password.',
    },
    productForm: {
      name: 'Product name',
      sku: 'SKU / reference',
      category: 'Category',
      choose: 'Choose...',
      brand: 'Brand',
      none: 'None',
      shortDescription: 'Short description',
      fullDescription: 'Full description',
      price: 'Price (FCFA)',
      promoPrice: 'Promo price (FCFA)',
      stock: 'Stock',
      lowStockThreshold: 'Low stock threshold',
      warranty: 'Warranty',
      status: 'Status',
      draft: 'Draft',
      published: 'Published',
      featured: 'Featured product',
      images: 'Images',
      mainImage: 'Main',
      setAsMain: 'Set as main',
      uploading: 'Uploading...',
      uploadError: 'Image upload failed.',
      characteristics: 'Specifications',
      addAttribute: '+ Add',
      attributeKeyPlaceholder: 'Key (e.g. RAM)',
      attributeValuePlaceholder: 'Value (e.g. 12 GB)',
      categoryRequired: 'Please choose a category.',
      saveError: 'Error while saving.',
    },
    productsPage: {
      title: 'Products',
      newProduct: '+ New product',
      searchPlaceholder: 'Search (name, SKU)...',
      search: 'Search',
      noProducts: 'No products.',
      stockAdjustError: 'Stock adjustment failed.',
      confirmDelete: 'Delete this product?',
      deleteError: 'Deletion failed.',
      removeStock: 'Remove one stock unit',
      addStock: 'Add one stock unit',
      unpublish: 'Unpublish',
      publish: 'Publish',
      duplicate: 'Duplicate',
      newProductTitle: 'New product',
      editProductTitle: 'Edit "{name}"',
    },
    promotionsPage: {
      title: 'Promotions',
      newPromotion: '+ New promotion',
      searchPlaceholder: 'Search (name)...',
      search: 'Search',
      noPromotions: 'No promotions.',
      actionError: 'Action failed.',
      confirmDelete: 'Delete this promotion?',
      deleteError: 'Deletion failed.',
      discount: 'Discount',
      target: 'Target',
      period: 'Period',
      priority: 'Priority',
      productsCount: 'product(s)',
      categoriesCount: 'categorie(s)',
      activate: 'Activate',
      deactivate: 'Deactivate',
      backToDraft: 'Set back to draft',
      fixedPrice: 'Fixed price',
      statusDraft: 'Draft',
      statusScheduled: 'Scheduled',
      statusActive: 'Active',
      statusExpired: 'Expired',
      statusDisabled: 'Disabled',
      newPromotionTitle: 'New promotion',
      editPromotionTitle: 'Edit "{name}"',
    },
    promotionForm: {
      name: 'Promotion name',
      status: 'Status',
      activeHint:
        '"Active" does not mean visible right away: the promotion only shows during its scheduled period (§14).',
      description: 'Description (internal use)',
      discountType: 'Discount type',
      percentage: 'Percentage (%)',
      fixedAmount: 'Fixed amount (FCFA)',
      fixedPriceOption: 'Fixed price (FCFA)',
      value: 'Value',
      priority: 'Priority',
      priorityHint: 'When several promotions apply to a product, the highest priority wins.',
      startDate: 'Start',
      endDate: 'End',
      conditions: 'Conditions (optional, shown to customers)',
      conditionsPlaceholder: 'E.g. While stocks last',
      bannerTitle: 'Banner title (homepage)',
      bannerSubtitle: 'Banner subtitle',
      bannerImage: 'Banner image (homepage)',
      targetedCategories: 'Targeted categories',
      noCategories: 'No categories.',
      targetedProducts: 'Targeted products',
      noProducts: 'No products.',
      targetHint:
        'A promotion can target whole categories and/or specific products (§13). If none is selected, the promotion applies to no product.',
      datesRequired: 'Please provide a start date and an end date.',
      endAfterStart: 'The end date must be after the start date.',
    },
    boutiqueForm: {
      name: 'Store name',
      address: 'Address',
      phone: 'Phone',
      hours: 'Hours',
      hoursPlaceholder: 'E.g. Mon-Sat: 8:30am - 7:00pm',
      description: 'Description',
      latitude: 'Latitude',
      longitude: 'Longitude',
      googleMapsLink: 'Google Maps link',
      sortOrder: 'Display order',
      activeLabel: 'Active store (visible on the public site)',
      photos: 'Photos',
      latLngError: 'Provide both latitude AND longitude, or neither.',
      newBoutiqueTitle: 'New store',
      editBoutiqueTitle: 'Edit "{name}"',
    },
    newsPageAdmin: {
      title: 'News',
      newArticle: '+ New article',
      searchPlaceholder: 'Search (title)...',
      search: 'Search',
      noArticles: 'No articles.',
      confirmDelete: 'Delete this article?',
      deleteError: 'Deletion failed.',
      titleColumn: 'Title',
      category: 'Category',
      newArticleTitle: 'New article',
      editArticleTitle: 'Edit "{title}"',
    },
    articleForm: {
      title: 'Title',
      author: 'Author',
      category: 'Category',
      date: 'Date',
      coverImage: 'Cover image',
      content: 'Content',
      contentHint: 'Formatting (headings, bold, lists, links...) is displayed as-is on the public site.',
      contentRequired: 'Content cannot be empty.',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      status: 'Status',
    },
    pagesPageAdmin: {
      title: 'Content pages',
      newPage: '+ New page',
      subtitle:
        'About, Delivery, Warranty & Support, Legal notice, Terms, Privacy policy... each published page is available at its own URL (e.g. /a-propos), with no developer involvement (§22).',
      noPages: 'No pages.',
      confirmDelete: 'Delete this page?',
      deleteError: 'Deletion failed.',
      titleColumn: 'Title',
      updatedAt: 'Updated',
      newPageTitle: 'New page',
      editPageTitle: 'Edit "{title}"',
    },
    pageForm: {
      title: 'Title',
      publicUrl: 'Public URL: /{slug}',
      illustrationImage: 'Illustration image',
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}
