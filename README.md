# Amza Futur Telecom — Phases 1 à 6 (Fondations + Produits + Promotions + Boutiques + Contenu + Contact/Notifications + Journal d'activité)

Ce dépôt contient l'implémentation de la plateforme Amza Futur Telecom, conformément au
cahier des charges v2.0 : un backend NestJS + Prisma/PostgreSQL et un frontend Next.js +
TypeScript + Tailwind.

**Important** : ce code a été écrit dans un environnement sans accès à npm/pip (sandbox
réseau restreint). Il est correct et suit les conventions standards de NestJS/Prisma/Next.js,
mais **n'a pas pu être exécuté ni compilé dans cet environnement**. Suis les étapes
ci-dessous sur ta machine (avec un accès internet normal) pour l'installer et le tester.
Si tu rencontres une erreur au premier lancement, dis-le moi et je corrige.

## Ce qui est fait

**Phase 1 — Fondations + Produits**

- Authentification JWT (access + refresh token avec rotation) et RBAC dynamique
  (Role/Permission en base de données, pas de rôle codé en dur).
- Trois rôles pré-configurés par le seed : `SUPER_ADMIN`, `GESTIONNAIRE`, `EDITEUR`,
  avec les permissions de la matrice du §27 du cahier des charges.
- Gestion des utilisateurs administrateurs (créer/modifier/désactiver un compte).
- Modules Catégories, Marques et Produits complets : CRUD admin, publication/dépublication,
  duplication, gestion du stock, upload d'images (stockage local), caractéristiques
  dynamiques, endpoints publics filtrés/triés/paginés pour le catalogue.
- Calcul dynamique de l'état du stock (Disponible / Stock faible / Rupture) — jamais codé
  en dur côté frontend.
- Site public : accueil (catégories + produits vedettes), catalogue avec filtres, fiche
  produit avec génération du message WhatsApp (§18).
- Back-office : connexion, tableau de bord, gestion des produits/catégories/marques, gestion
  des comptes administrateurs (`/admin/utilisateurs` — page ajoutée lors de l'analyse
  d'ensemble : l'API existait depuis le début de la phase 1, mais sans interface avant cela,
  voir « Analyse d'ensemble »).

**Phase 2 — Module Promotions/Réductions (§13-17 du cahier des charges)**

- Modèle `Promotion` : type (pourcentage, montant fixe, prix fixe), ciblage par produits
  et/ou catégories, période de validité, priorité, statut administratif
  (brouillon/active/désactivée) distinct du **statut d'affichage** calculé automatiquement
  (`brouillon → programmée → active → expirée`, selon la date du jour) — une promotion
  programmée s'active et s'expire donc toute seule, sans tâche planifiée (§14).
- Moteur de prix : calcule le **prix effectif** de chaque produit à partir de son prix
  promo « manuel » (existant depuis la phase 1, agit comme réduction de dernier recours) et
  des promotions-campagnes qui le concernent, avec une règle de priorité claire (priorité la
  plus élevée gagne, jamais de cumul de plusieurs remises).
- Back-office Promotions complet : liste avec statut/filtre/recherche, création/modification
  avec sélection des produits et catégories ciblées, activer/désactiver/repasser en
  brouillon, suppression.
- Site public : section « Promotions en cours » sur l'accueil (bannières), badge de
  réduction et prix barré sur les fiches produit et le catalogue partout où un produit est
  en promotion (manuelle ou via une campagne), filtre « En promotion » du catalogue mis à
  jour pour tenir compte des campagnes.
- Tableau de bord admin : compteurs promotions actives / programmées.

**Phase 3 — Module Boutiques (§19, §5.8 du cahier des charges)**

- Modèle `Boutique` avec exactement les champs du §19 : nom, adresse, téléphone, WhatsApp,
  horaires, description, coordonnées GPS (latitude/longitude), lien Google Maps, photos
  (plusieurs, avec photo principale) et statut actif/inactif.
- Back-office Boutiques complet : liste, création/modification avec upload de photos,
  activer/désactiver, suppression.
- Site public : page dédiée `/boutiques` listant toutes les boutiques actives avec leurs
  coordonnées complètes (téléphone cliquable, lien WhatsApp, lien Google Maps), et une
  section « Nos boutiques » sur l'accueil (§5.8) qui en présente un aperçu — une boutique
  ajoutée dans l'admin apparaît automatiquement sur le site, sans action supplémentaire.
- Lien « Boutiques » ajouté à la navigation du site public.
- Tableau de bord admin : compteur du nombre de boutiques.

**Phase 4 — Actualités + Pages de contenu (§20, §22 du cahier des charges)**

- Modèle `Article` (Actualités) avec les champs du §20 : titre, slug, image, contenu,
  auteur, date, catégorie (libre), statut, SEO Title/Description. Back-office avec
  liste/recherche/filtre par statut, création/modification, publier/dépublier, suppression.
- Modèle `Page` (Pages de contenu) avec les champs du §22 : titre, slug, contenu, image
  d'illustration, SEO Title/Description, statut, date de mise à jour. Permet de gérer
  « sans développeur » les pages À propos, Livraison, Garantie et SAV, Mentions légales,
  CGU, Politique de confidentialité, etc.
- Site public : page `/actualites` (liste paginée) et `/actualites/[slug]` (détail) ; les
  pages de contenu sont servies sur une **URL racine** (`/a-propos`, `/livraison`...) via une
  route générique, pour coller au plan du site du §5 où ces pages sont des entrées de menu
  de premier niveau — une page créée et publiée dans l'admin est donc accessible
  immédiatement à cette URL, sans déploiement (règle du §42).
- Accueil : bloc « Présentation de l'entreprise » (§5.7) alimenté par la page « À propos »
  si elle existe et est publiée, et section « Dernières actualités ».
- Pied de page : bloc « Liens utiles » (§5.10) vers les pages de contenu et les autres
  sections du site.
- Tableau de bord admin : compteurs actualités publiées / pages de contenu.
- RBAC : accès total (créer/lire/modifier/supprimer/publier) réservé au Super Admin et à
  l'Éditeur ; le Gestionnaire n'y a aucun accès — conformément à la matrice du §27.

**Phase 5 — Formulaire de contact + Notifications internes (§23, §29 du cahier des charges)**

- Modèle `ContactMessage` (§23) : nom, contact (téléphone ou email en un seul champ, comme
  demandé), sujet, message, statut (`Nouveau` → `Lu` → `Traité`). Le passage de `Nouveau` à
  `Lu` est automatique dès que l'admin ouvre le message dans le back-office ; le passage à
  `Traité` (et le retour à `Lu`) est une action manuelle.
- Formulaire de contact public `/contact` : envoie un message via `POST /api/contact` (route
  publique). Anti-spam à deux niveaux (voir « Limites connues ») : champ honeypot invisible
  et limite de 5 messages / 10 minutes par adresse IP.
- Modèle `Notification` (§29) et cloche de notifications dans le back-office (icône 🔔 dans
  la barre d'administration, rafraîchie toutes les 60 secondes) : liste les notifications,
  compteur de non-lues, marquer une notification comme lue / tout marquer comme lu. Trois
  événements génèrent une notification stockée en base :
  - un nouveau message de contact est reçu ;
  - le stock d'un produit passe à « Stock faible » ou « Rupture » (jamais renotifié tant que
    le statut ne se dégrade pas davantage — un réapprovisionnement ne génère pas de
    notification) ;
  - en complément, la cloche affiche aussi des notifications **virtuelles**, calculées à la
    volée et jamais stockées en base : une par promotion active qui expire dans les 48
    heures (même logique de calcul dynamique que le statut d'affichage des promotions en
    phase 2 — pas de tâche planifiée nécessaire).
- Back-office Messages (`/admin/messages`) : liste avec filtre par statut, détail d'un
  message, changement de statut, suppression.
- Tableau de bord admin : compteur « Messages non traités ».
- RBAC : nouvelles permissions `messages:read` / `messages:update` / `messages:delete`. Le
  Gestionnaire a lecture + traitement (pas de suppression) conformément au §27 ; l'Éditeur
  n'a aucun accès aux messages.

**Phase 6 — Journal d'activité (§28 du cahier des charges)**

- Modèle `ActivityLog` : chaque entrée capture qui (nom + email, en instantané — l'historique
  reste lisible même si le compte est supprimé plus tard), quoi (action : création,
  modification, suppression, publication, changement de statut, connexion...), sur quelle
  ressource et quand.
- Alimenté **automatiquement** par un intercepteur global (`ActivityLogInterceptor`) qui
  observe toutes les requêtes de modification (`POST`/`PATCH`/`PUT`/`DELETE`) faites sur une
  route `/admin/...` et en déduit la ressource/l'action à partir du chemin de la route —
  plutôt que d'ajouter un appel de journalisation dans chacun des ~15 modules existants un
  par un. Les connexions (`LOGIN`) sont journalisées séparément par `AuthService`, car la
  route de connexion est publique et n'a donc pas d'utilisateur authentifié au moment de la
  requête pour l'intercepteur générique.
- Une entrée du journal ne peut jamais faire échouer l'action qu'elle enregistre : un échec
  d'écriture du journal est avalé et seulement journalisé côté serveur
  (`ActivityLogService.record`).
- Back-office Journal (`/admin/journal`) : liste paginée, filtrable par ressource, par type
  d'action et par période.
- RBAC : nouvelle permission `activity-log:read`, accordée uniquement au Super Admin (voir
  « Limites connues » — le cahier des charges ne précise pas explicitement quel rôle doit y
  avoir accès ; un journal d'audit étant par nature un accès sensible, un défaut restrictif a
  été retenu plutôt que de l'ouvrir à tous les administrateurs).

## Revue de code (relecture complète, après la phase 5)

Une relecture complète du projet (les 5 phases, back-end et front-end) a été faite après la
livraison de la phase 5, pour rattraper ce qu'une compilation/exécution normale aurait
détecté automatiquement mais que cet environnement ne permet pas. Ce qui a été trouvé et
corrigé :

- **Le catalogue public (`/produits`) pouvait planter entièrement** sur une URL malformée
  (ex. `?minPrice=abc`, `?page=1.5`, `?sort=xyz`) : ces valeurs remontaient telles quelles à
  l'API, qui les rejette (400) avec sa validation stricte, et rien ne rattrapait cette
  erreur còté page. Corrigé : les paramètres sont maintenant validés/nettoyés avant l'appel,
  l'appel est protégé par un filet de secours (liste vide plutôt que plantage), et une page
  d'erreur générique (`app/(site)/error.tsx`) a été ajoutée pour tout le site public au cas où
  un autre cas imprévu se présenterait.
- **Les messages d'erreur de validation étaient illisibles** quand plusieurs champs
  échouaient à la fois (NestJS renvoie un tableau de messages, affiché collé sans espaces
  une fois converti en texte). Corrigé dans `lib/admin-api.ts` et `lib/api.ts`.
- **La galerie photo d'une fiche produit était cassée** : la vignette n°1 dupliquait
  toujours l'image principale et aucune vignette n'était cliquable (impossible de voir les
  photos 2, 3...). Extrait dans un petit composant client dédié (`ProductGallery.tsx`) qui
  permet de changer l'image principale en cliquant sur une vignette.
- **L'ajustement rapide de stock** (`PATCH /admin/products/:id/stock`, déjà présent côté
  API) n'était relié à aucun bouton du back-office. Ajout de boutons +/- directement dans la
  liste des produits (`/admin/produits`), en plus du champ Stock du formulaire complet.
- **Suppression/modification d'un compte utilisateur inexistant** renvoyait une erreur 500
  brute au lieu d'un 404 propre (seul module à ne pas vérifier l'existence avant d'agir).
  Corrigé dans `UsersService`.
- **Un `categoryId`/`brandId` invalide (Produits) ou des `productIds`/`categoryIds`
  invalides (Promotions)** — par exemple une catégorie supprimée entre l'ouverture du
  formulaire et l'enregistrement — remontaient comme une erreur 500 (violation de clé
  étrangère côté base) au lieu d'un message clair. Les deux services vérifient maintenant
  l'existence des références avant d'écrire.
- **La pagination publique des Actualités ignorait silencieusement son défaut voulu** (12
  par page) à cause d'un défaut hérité (20) déjà appliqué avant que le repli `?? 12` du code
  ne puisse jouer son rôle. Corrigé en surchargeant explicitement le défaut sur le DTO
  concerné.
- **L'upload d'image était verrouillé sur la permission `products:update`**, même pour
  téléverser une photo de boutique ou d'actualité — ça fonctionnait seulement parce que les
  rôles actuels cumulent les deux, mais un futur rôle plus restreint (ex. éditeur boutiques
  uniquement) n'aurait pas pu téléverser d'image. Ajout d'une permission dédiée
  `media:upload`, attribuée à tous les rôles qui gèrent du contenu avec images.
- Le champ **Image de bannière** d'une promotion existait déjà côté modèle/API (§16) mais
  n'était pas exposé dans le formulaire d'administration : impossible de la définir sans
  passer directement par l'API. Ajouté au formulaire Promotions.
- Corrections mineures : validation client (longueur minimale des champs) alignée sur les
  règles du back-end pour le formulaire de contact ; cohérence des commentaires ESLint sur
  quelques pages admin ; ajout du fichier de configuration ESLint manquant
  (`frontend/.eslintrc.json`) alors que le projet en présuppose un dans son code.

**Point non corrigé, à traiter dans une prochaine itération** : le back-office affiche
aujourd'hui les mêmes boutons (créer/modifier/supprimer/publier...) à tout administrateur
connecté, quel que soit son rôle — la sécurité réelle est bien appliquée côté API (chaque
route vérifie la permission requise et renvoie une erreur 403 sinon), mais un compte
Gestionnaire ou Éditeur peut voir un bouton qui échouera au clic plutôt que de ne pas le
voir du tout. Corriger ça proprement demande de récupérer les permissions de
l'utilisateur connecté (`GET /auth/me`, déjà disponible côté API) et de les propager dans
toute l'interface d'administration — un chantier à part entière plutôt qu'un correctif
ponctuel, qu'il vaut mieux traiter dans une phase dédiée avec un vrai test de chaque rôle.

## Revue de code — vérification ciblée de la phase 1 (fondations)

À la demande d'une relecture précise phase par phase, la phase 1 (authentification/RBAC,
utilisateurs, rôles, catégories, marques, produits) a été intégralement relue en détail,
fichier par fichier, back-end et front-end, migration SQL comprise (comparée ligne à ligne
au schéma Prisma actuel — aucune dérive trouvée). Ce qui a été trouvé et corrigé :

- **Faille de sécurité critique : un compte désactivé pouvait continuer à renouveler sa
  session indéfiniment.** `UsersService.update()` désactive correctement un compte
  (`isActive: false`), mais `AuthService.refresh()` ne vérifiait jamais ce champ avant
  d'émettre un nouvel access token — seul `login()` le faisait. Résultat : un compte
  désactivé gardait un accès complet tant qu'il détenait un refresh token valide (jusqu'à
  30 jours), ce qui annulait entièrement l'effet de la désactivation. Corrigé à trois
  niveaux : `refresh()` et `me()` vérifient désormais `isActive` et renvoient un 401 clair
  sinon, et `UsersService.update()` révoque immédiatement tous les refresh tokens actifs
  d'un compte au moment de sa désactivation (plutôt que d'attendre l'échec du prochain
  renouvellement).
- `AuthService.loadUserWithPermissions()` utilisait `findUniqueOrThrow`, qui aurait renvoyé
  une erreur 500 brute (exception Prisma non gérée) si l'utilisateur avait été supprimé
  entre l'émission de son token et son utilisation. Remplacé par `findUnique` + une
  exception 401 explicite.
- `UsersService.update()` ne vérifiait pas l'unicité de l'email avant d'écrire (contrairement
  à `create()`), risquant un 500 brut en cas de doublon. Ajout de la même vérification
  explicite que sur la création.
- **Aucune gestion globale de l'expiration de session côté front-end** : quand un token ne
  pouvait plus être renouvelé (session expirée, ou compte désactivé — voir ci-dessus),
  l'administrateur restait bloqué sur la page avec un message d'erreur générique à chaque
  action, sans être redirigé vers la connexion. Ajout d'une redirection automatique vers
  `/admin/login` dans le point d'entrée commun des appels API admin (`lib/admin-api.ts`)
  dès qu'un 401 survit à la tentative de rafraîchissement automatique déjà prévue par
  `authFetch`.
- La taille maximale d'upload (`MAX_UPLOAD_SIZE_MB`, déclarée dans `.env.example`) n'était
  en réalité jamais lue par le code : la limite était codée en dur à 5 Mo dans
  `media.controller.ts`. Corrigé pour lire la variable d'environnement.
- Le numéro WhatsApp du bouton principal (en-tête, accueil, fiche produit) était codé en dur
  (`0000000000`) à trois endroits différents du code. Centralisé dans une constante
  (`WHATSAPP_NUMBER`, `lib/api.ts`) réglable via `NEXT_PUBLIC_WHATSAPP_NUMBER` — en
  attendant un futur module Paramètres (§24), au moins la valeur ne nécessite plus de
  modifier le code à trois endroits ni de redéployer pour être ajustée.
- Commentaire obsolète dans `seed.ts` qui indiquait encore que les médias et le journal
  d'activité (phases 5 et 6) n'étaient pas implémentés.

### Deuxième passe, focalisée spécifiquement sur la sécurité de l'authentification

À la demande d'une insistance particulière sur la sécurité de la phase 1, une deuxième
relecture a ciblé uniquement `AuthController`/`AuthService` sous l'angle attaque (force
brute, chronométrage, vol de token, configuration manquante) plutôt que sous l'angle
fonctionnel. Trouvé et corrigé :

- **Énumération de comptes par chronométrage (`login()`)** : quand l'email n'existait pas,
  la fonction renvoyait immédiatement une erreur sans jamais appeler `bcrypt.compare` ; quand
  l'email existait mais le mot de passe était faux, `bcrypt.compare` s'exécutait (~100 ms,
  coût volontaire du bcrypt). Un attaquant pouvait donc deviner quels emails sont enregistrés
  rien qu'en mesurant le temps de réponse de `/auth/login`, sans jamais connaître le mot de
  passe. Corrigé : `bcrypt.compare` s'exécute désormais systématiquement, y compris pour un
  email inconnu (comparaison contre un hash bidon généré une fois puis réutilisé), pour que
  le temps de réponse ne dépende plus de l'existence du compte.
- **Aucune limite de tentatives sur `/auth/login` et `/auth/refresh`** : rien n'empêchait un
  script d'essayer des milliers de mots de passe par minute contre un compte connu. Ajout de
  `@nestjs/throttler`, activé uniquement sur `AuthController` (pas globalement, pour ne pas
  risquer de limiter le trafic normal du catalogue public) : 10 tentatives par minute et par
  IP sur le login et le rafraîchissement de session.
- **Pas de détection de réutilisation d'un refresh token révoqué.** La rotation des refresh
  tokens était déjà en place (chaque `refresh()` révoque l'ancien et en émet un nouveau),
  mais rejouer un refresh token déjà révoqué ne faisait que rejeter cette seule requête —
  sans réagir au signal que cela représente. Si un attaquant vole un refresh token déjà
  utilisé par son propriétaire légitime (donc déjà révoqué côté serveur), le rejeu de ce
  token par l'un ou l'autre est désormais traité comme une preuve probable de vol : toutes
  les sessions actives de l'utilisateur concerné sont immédiatement révoquées, forçant une
  reconnexion partout (pratique recommandée pour la rotation de refresh tokens).
- **Aucune vérification au démarrage que les secrets JWT sont bien configurés.** Sans
  `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` définis, l'application démarrait normalement et
  ne plantait qu'au premier login, avec une erreur bas niveau peu explicite (`jsonwebtoken`
  refusant de signer avec une clé vide). Ajout d'une vérification explicite au démarrage
  (`main.ts`) qui arrête l'application avec un message clair si l'une de ces variables
  manque.

Deux points identifiés mais volontairement non modifiés, documentés dans « Limites connues »
plutôt que corrigés en dur, car la bonne réponse dépend de l'environnement de déploiement
(inconnu à ce stade) : la fiabilité de la limitation par IP derrière un éventuel reverse
proxy (`trust proxy`), et le stockage des tokens dans `localStorage` côté navigateur plutôt
que dans un cookie `httpOnly`.

Aucune autre anomalie trouvée sur le périmètre de la phase 1 : DTOs et validations,
garde JWT/RBAC (`JwtAuthGuard`, `PermissionsGuard`), services Catégories/Marques (unicité de
slug, blocage de suppression si des produits sont liés), DTOs et mapper Produits (y compris
le calcul du prix effectif et de son cas limite prix = 0), ordre des routes du contrôleur
Produits (`/admin/products/alerts` avant `/admin/products/:id`), pages d'administration et
pages publiques du catalogue — tout est cohérent avec le cahier des charges.

## Revue de code — vérification ciblée de la phase 2 (promotions/réductions)

Même exercice que pour la phase 1, appliqué au module Promotions (moteur de calcul du prix
effectif, back-office, affichage public), migration SQL comprise (comparée ligne à ligne au
schéma Prisma actuel — aucune dérive trouvée). Ce qui a été trouvé et corrigé :

- **Le champ « Image de bannière » d'une promotion n'avait aucun effet visible sur le site
  public.** Une relecture précédente (voir « Revue de code », après la phase 5) avait déjà
  ajouté ce champ au formulaire d'administration après avoir constaté qu'il existait en base
  sans être exposé côté admin — mais personne n'avait ensuite branché son affichage réel :
  la bannière « Promotions en cours » de la page d'accueil n'affichait que `bannerTitle` et
  `bannerSubtitle` sur un simple aplat de couleur, jamais l'image elle-même. Un administrateur
  pouvait donc téléverser une image de bannière en pensant qu'elle serait visible, sans que
  rien ne se passe. Corrigé : la bannière affiche maintenant l'image en fond (avec un léger
  assombrissement pour garder le texte lisible) quand elle est renseignée, et se comporte
  comme avant (aplat de couleur) sinon.
- **Un `productIds`/`categoryIds` contenant un doublon faisait planter la création ou la
  modification d'une promotion avec une erreur 500 brute** (violation de contrainte unique
  Prisma sur la clé composite `promotionId`+`productId`), au lieu d'être simplement ignoré.
  Le formulaire d'administration ne peut pas produire ce cas (cases à cocher, un produit ne
  peut être sélectionné qu'une fois), mais rien ne protégeait un appel API direct. Corrigé en
  dédoublonnant les identifiants avant l'écriture en base, dans `create()` et `update()`.

Aucune autre anomalie trouvée à ce stade (première passe fonctionnelle) : moteur de prix
effectif (`resolveEffectivePrice`) et sa règle de priorité/cumul (§14 — une seule remise à la
fois, priorité numérique puis ancienneté, prix promo « manuel » toujours de priorité la plus
basse), validations (pourcentage 1-100, montant/prix fixe non négatif, date de fin
postérieure à la date de début, existence des produits/catégories ciblés), statut affiché
calculé dynamiquement à partir des dates plutôt que stocké (`computePromotionStatus`),
cohérence du prix effectif à travers tous les points d'accès en lecture (liste admin, liste
publique, produit vedette, fiche produit, filtre « en promotion », duplication) — un même
produit affiche toujours le même prix effectif quel que soit l'endroit d'où il est consulté.
Le RBAC des routes (5 actions `promotions:*`, cohérentes entre le seed et les routes) semblait
correct à ce stade — la deuxième passe ci-dessous a trouvé qu'il ne l'était en réalité pas
complètement.

### Deuxième passe, focalisée spécifiquement sur la sécurité (RBAC)

À la demande d'une insistance sur la sécurité, une deuxième relecture a cherché des façons de
contourner les permissions plutôt que de vérifier qu'elles étaient posées au bon endroit
(ce que la première passe avait déjà fait). Trouvé et corrigé — un vrai contournement de
permission, présent de façon identique dans quatre modules :

- **`promotions:activate` pouvait être totalement contourné en passant par `create()` ou
  `update()`.** Le module Promotions a une permission dédiée (`promotions:activate`) pour
  activer/désactiver une promotion, avec ses propres routes (`/activate`, `/disable`,
  `/draft`) — mais le champ `adminStatus` fait aussi partie du DTO général de
  création/modification (pratique : on peut créer une promotion déjà active en un seul
  appel). Résultat : un rôle qui n'aurait QUE `promotions:create`/`promotions:update` (sans
  `promotions:activate`) pouvait quand même activer ou désactiver une promotion en le
  glissant dans ce DTO plutôt que par les routes dédiées — ce qui rendait
  `promotions:activate` complètement décoratif. **Le même défaut existait à l'identique dans
  trois autres modules** qui suivent exactement le même schéma (une permission "publier"
  séparée, mais un champ `status` accessible via le DTO général) : Produits
  (`products:publish` contournable via `create()`/`update()`), Actualités
  (`articles:publish`) et Pages de contenu (`pages:publish`). Corrigé dans les quatre
  services (`assertCanSetAdminStatus`/`assertCanSetStatus`) : passer directement au statut
  "publié/actif" via le DTO général exige désormais la permission dédiée, exactement comme
  via la route dédiée ; repasser en brouillon reste libre (c'est l'état par défaut, sans
  effet visible tant qu'il n'est pas publié). **Aucun impact sur le comportement actuel** :
  les deux seuls rôles concernés (SUPER_ADMIN, GESTIONNAIRE pour les promotions et produits ;
  SUPER_ADMIN, ÉDITEUR pour les actualités et pages) ont déjà les deux permissions dans
  chaque cas — ce correctif protège uniquement un rôle plus restreint qui serait ajouté dans
  une phase future (ex. un « rédacteur » qui rédige des actualités mais ne peut pas les
  publier sans validation).

Vérifié sans trouver d'autre anomalie : IDOR (identifiants `cuid()` non séquentiels, non
devinables), injection (toutes les requêtes Prisma sont paramétrées), fuite de données sur
la route publique `/promotions/active` (seuls les champs destinés à l'affichage public sont
renvoyés — pas `description`, `conditions`, dates de création/modification), CSRF (sans objet
ici : l'authentification se fait par jeton dans l'en-tête `Authorization`, jamais par cookie).

**Nuance identifiée, non corrigée** : la règle de départage à priorité égale (§14, « la plus
récemment créée/activée l'emporte ») est implémentée en se basant sur la date de création de
la promotion (`createdAt`), pas sur une éventuelle date d'activation ultérieure — le modèle
de données n'a pas de colonne `activatedAt` distincte. En pratique, une promotion créée en
brouillon puis activée plus tard sera donc départagée par sa date de création, pas par sa
date d'activation réelle, si le cahier des charges voulait distinguer les deux. Ajouter une
colonne dédiée est possible si cette distinction s'avère importante en pratique.

## Revue de code — vérification ciblée de la phase 3 (boutiques)

Même exercice que pour les phases 1 et 2, sécurité comprise d'emblée cette fois, appliqué au
module Boutiques (§19), migration SQL comprise (comparée ligne à ligne au schéma Prisma
actuel — aucune dérive trouvée).

**RBAC de ce module spécifiquement : rien à corriger.** Contrairement aux promotions, aux
produits, aux actualités et aux pages (voir plus haut), `activate()`/`disable()` exigent ici
la même permission (`boutiques:update`) que la modification générale — il n'existe pas de
permission séparée à contourner via le DTO général. Ce module ne reproduit donc pas la
faille corrigée dans les quatre autres.

- **Une latitude sans longitude (ou l'inverse) pouvait être enregistrée.** Le formulaire
  d'administration bloque déjà ce cas côté client, mais rien ne l'empêchait côté API — un
  appel direct (ou une régression future du formulaire) pouvait enregistrer une coordonnée
  à moitié renseignée, inutilisable pour afficher une carte. Corrigé en reportant la même
  règle côté serveur (`create()` et `update()`), en tenant compte de l'état déjà existant
  pour une modification partielle (mettre à jour uniquement les horaires, par exemple, ne
  doit pas redemander les deux coordonnées si elles étaient déjà cohérentes).
- **Le tableau de bord (`/admin/dashboard/stats`) laissait fuiter des compteurs de
  ressources que l'appelant n'a pourtant pas le droit de consulter directement.** Trouvé en
  vérifiant comment le compteur de boutiques y remonte, mais le défaut concerne toute la
  route : elle n'exige que la permission `products:read` (la seule que tous les rôles
  admin possèdent), alors qu'elle renvoie aussi les compteurs Promotions, Messages de
  contact, Actualités, Pages, etc. Concrètement, le rôle Éditeur — qui n'a ni
  `promotions:read` ni `messages:read` — voyait quand même le nombre de promotions actives
  et de messages non traités sur son tableau de bord ; symétriquement, le rôle Gestionnaire
  voyait les compteurs Actualités/Pages sans avoir `articles:read`/`pages:read`. Corrigé :
  chaque section du tableau de bord n'est renvoyée que si l'appelant détient la permission
  de lecture correspondante ; une section non autorisée est renvoyée à zéro plutôt
  qu'omise, pour ne pas casser la forme de réponse attendue par le front-end (et donc sans
  changement d'interface pour les rôles qui ont légitimement accès à tout, Super Admin en
  tête).

Vérifié sans trouver d'autre anomalie : permissions RBAC (4 actions `boutiques:*`,
cohérentes entre le seed, les routes et le README qui documente déjà la limite « accès
Gestionnaire non filtré par attribution », §27), IDOR (identifiants `cuid()` non
devinables), le filtre `isActive` de la route publique (une boutique désactivée
disparaît immédiatement de `/boutiques`, aucune donnée sur les boutiques inactives n'y
fuit), absence d'injection (toutes les requêtes Prisma sont paramétrées), absence de XSS
(nom, adresse, description, horaires sont rendus comme texte échappé par React — pas de
`dangerouslySetInnerHTML` contrairement aux contenus HTML des Actualités/Pages, déjà
documenté comme limite connue).

## Revue de code — vérification ciblée de la phase 4 (actualités/pages)

Même exercice, sécurité comprise d'emblée, appliqué au module Actualités/Pages de contenu
(§20/§22), migration SQL comprise (comparée ligne à ligne au schéma Prisma actuel pour
`Article`/`Page`/`PublishStatus` — aucune dérive trouvée).

**Trouvaille la plus grave de toute la revue jusqu'ici : une XSS stockée dans le contenu des
actualités et des pages, exploitable jusqu'au vol de compte administrateur.** Le champ
« Contenu » de ces deux modules accepte du HTML tapé directement par l'administrateur (pas
encore de véritable éditeur WYSIWYG), et ce HTML était injecté tel quel dans la page publique
via `dangerouslySetInnerHTML` (`app/(site)/actualites/[slug]/page.tsx` et
`app/(site)/[slug]/page.tsx`), sans aucun filtrage. Or ce champ n'est protégé que par les
permissions `articles:create`/`update` ou `pages:create`/`update` — pas forcément détenues
par un Super Admin, un rôle Éditeur les possède aussi. Un Éditeur malveillant (ou un compte
Éditeur compromis) pouvait donc publier une actualité ou une page contenant un `<script>` ou
un gestionnaire d'événement (`onerror`, etc.), qui s'exécutait ensuite dans le navigateur de
**chaque visiteur** ouvrant cette page — site public compris, pas seulement le back-office.
Et comme le site public et le back-office partagent la même origine, donc le même
`localStorage` (voir `lib/auth.ts` et la limite « Tokens d'authentification stockés dans
`localStorage` » plus bas), ce script pouvait aussi lire les jetons de connexion d'un
administrateur qui aurait le site public ouvert dans un autre onglet du même navigateur au
même moment — chaîne complète menant à une usurpation de compte Super Admin par un Éditeur.
C'est exactement le scénario que la limite « localStorage » ci-dessous évoquait déjà de façon
théorique (« si une faille XSS existait ailleurs sur le site ») : cette revue en a trouvé une
concrète, et elle est corrigée ci-dessous.

Corrigé en assainissant ce HTML **à l'écriture** (dans `create()` et `update()` des deux
services, pas seulement à l'affichage, pour que les données déjà en base soient toujours
propres) via le paquet `sanitize-html`, avec une liste blanche de balises reprenant
exactement ce que l'interface d'administration annonce déjà accepter (paragraphes, gras,
italique, listes, titres de niveau 2/3, citations, liens) : `p`, `br`, `strong`, `b`, `em`,
`i`, `u`, `ul`, `ol`, `li`, `h2`, `h3`, `blockquote`, `a`. Tout le reste — `script`, `iframe`,
attributs `on...`, styles en ligne, liens `javascript:`/`data:` — est supprimé ; les liens
conservés se voient forcer `rel="noopener noreferrer"` pour éviter le « reverse tabnabbing »
sur les liens ouverts dans un nouvel onglet. Voir
`backend/src/common/utils/sanitize-html.util.ts` pour le détail et le raisonnement complet en
commentaire.

Vérifié sans trouver d'autre anomalie : RBAC (`articles:publish`/`pages:publish` ne peuvent
pas être contournées via le DTO général — ce module suit déjà le pattern corrigé en phase 2),
les slugs réservés des pages (`admin`, `produits`, `boutiques`, `actualites`, `contact`,
`api`, `uploads`) qui protègent les routes existantes du site contre une page qui essaierait
de les réutiliser, la génération de slugs (`slugify` en mode strict supprime tout caractère
non alphanumérique, ce qui écarte une tentative de path traversal via le titre), la
pagination publique des actualités (limite par défaut à 12 conservée, page négative ou hors
bornes gérée sans erreur), et les DTO/formulaires d'administration (`ArticleForm.tsx`,
`PageForm.tsx`) dont l'avertissement affiché aux utilisateurs correspond exactement à la
liste blanche du nettoyeur.

### Deuxième passe, encore plus poussée sur la sécurité

En creusant plus loin sur ce même module : le champ `image` des actualités et des pages
(`@IsString()` seul, sans autre contrainte) était censé ne recevoir que le chemin renvoyé par
l'upload (`MediaService.buildUrl`, toujours de la forme `/uploads/<fichier>`), mais rien
n'empêchait d'y enregistrer directement, via l'API, n'importe quelle URL absolue — un compte
disposant seulement de `articles:create`/`update` ou `pages:create`/`update` (un Éditeur,
donc, pas forcément Super Admin) pouvait le faire.

**Conséquence concrète : un déni de service auto-infligeable ou malveillant sur une page
publique entière.** Le site public affiche ces images via `next/image`, qui n'autorise que
les hôtes listés dans `images.remotePatterns` (`next.config.mjs`, restreint à
`localhost:3001/uploads/**`) et lève une exception au rendu pour tout autre hôte. Sur la page
`/actualites/[slug]`, cela casse uniquement l'actualité concernée ; mais sur la liste
`/actualites`, les vignettes de toutes les actualités de la page sont rendues dans le même
composant serveur — une seule actualité avec un `image` invalide suffit donc à faire planter
**toute la liste publique des actualités**, pas seulement son propre article, jusqu'à ce
qu'un administrateur corrige ou vide le champ en base.

Corrigé en contraignant ce champ, dans `CreateArticleDto` et `CreatePageDto` (donc aussi
`UpdateArticleDto`/`UpdatePageDto`, qui en héritent via `PartialType`), à commencer
obligatoirement par `/uploads/` — exactement la forme que l'upload renvoie déjà en usage
normal, donc sans impact sur le formulaire d'administration existant (vérifié : il ne
soumet jamais autre chose que la valeur renvoyée par l'upload, ou rien du tout).

## Revue de code — vérification ciblée de la phase 5 (contact/notifications)

Même exercice, sécurité comprise d'emblée, appliqué au module Formulaire de contact +
Notifications internes (§23, §29), migration SQL comprise (comparée ligne à ligne au schéma
Prisma actuel pour `ContactMessage`/`Notification` — aucune dérive trouvée).

**Trouvaille principale : la cloche de notifications (`/admin/notifications`) contournait
entièrement le RBAC et affichait du contenu à des rôles qui n'y ont pourtant pas accès.**
`NotificationsController` n'a volontairement aucune permission dédiée au niveau du contrôleur
(§29 ne définit pas de ressource de permission propre pour la notification elle-même — un
choix assumé), mais chacune de ses quatre routes (liste, compteur de non-lues, marquer comme
lu, tout marquer comme lu) était complètement ouverte à tout utilisateur admin authentifié,
sans le moindre filtrage côté service. Or chaque notification porte sur une ressource qui,
elle, a bien sa propre permission de lecture : concrètement, le rôle Éditeur — qui n'a ni
`messages:read` ni `promotions:read` (§27) — voyait quand même, dans sa propre cloche, le nom
de l'expéditeur et le sujet de chaque nouveau message de contact, ainsi que le nom de chaque
promotion sur le point d'expirer. C'est la même faille de fond que celle corrigée sur le
tableau de bord en phase 3, mais ici sur du contenu réel (texte librement saisi par un
visiteur du site) et pas seulement des compteurs agrégés — donc plus grave.

Un deuxième problème découle du premier : `isRead` est un statut global sur la table
`notifications` (pas un statut par utilisateur — il n'existe pas de table de liaison
utilisateur/notification), donc « tout marquer comme lu » agissait pour tout le monde à la
fois. Avant correctif, un Éditeur pouvait ainsi faire disparaître de la cloche de TOUS les
administrateurs — Gestionnaire et Super Admin compris — une alerte de message de contact non
traité ou de promotion expirante, alors même qu'il n'avait pas le droit de la consulter
lui-même.

Corrigé en filtrant chaque notification, dans `NotificationsService`, par la permission de
lecture de sa ressource (`CONTACT_MESSAGE` → `messages:read`, `LOW_STOCK`/`OUT_OF_STOCK` →
`products:read`, `PROMOTION_EXPIRING` → `promotions:read`) :
- la liste et le compteur de non-lues n'incluent plus que les notifications que l'appelant a
  le droit de voir (éléments omis, pas mis à zéro — il s'agit d'une liste à longueur
  variable, pas d'un objet à forme fixe comme le tableau de bord, donc rien à préserver côté
  front-end) ;
- marquer une notification précise comme lue est refusé (403) si l'appelant n'a pas la
  permission correspondant à son type ;
- « tout marquer comme lu » ne marque désormais que les types que l'appelant a le droit de
  voir, jamais les autres — un Éditeur ne peut donc plus faire disparaître, pour les autres
  administrateurs, des alertes qu'il ne voit lui-même pas.

Deuxième anomalie, plus mineure, trouvée en vérifiant le formulaire de contact public : aucun
champ de `CreateContactMessageDto` (`name`, `contact`, `subject`, `message`) n'avait de
longueur maximale. Cette route est publique et non authentifiée ; seule une limite de
fréquence (5 messages / 10 minutes / IP) la protégeait, ce qui n'empêchait pas un unique
message avec un `message` de plusieurs mégaoctets d'alourdir inutilement le stockage et
l'affichage dans `/admin/messages`. Corrigé avec des longueurs maximales généreuses mais
réalistes (100/150/200/5000 caractères) qui ne gênent aucun usage normal.

Vérifié sans trouver d'autre anomalie : permissions RBAC des routes `admin/messages/*`
(cohérentes avec le seed et avec le §27 — Gestionnaire en lecture/traitement sans
suppression, Éditeur sans aucun accès), absence d'IDOR (identifiants `cuid()` non
devinables), le piège honeypot (répond succès sans rien enregistrer ni notifier, pour ne pas
révéler la défense à un bot), l'absence de XSS (nom/sujet/message affichés comme texte
échappé par React dans l'admin, pas de `dangerouslySetInnerHTML` sur ce module), et la
logique de non-renotification du stock (un produit qui repasse de « Rupture » à « Stock
faible » puis de nouveau à « Rupture » renotifie bien, seul un réapprovisionnement complet ne
génère aucune notification).

## Revue de code — vérification ciblée de la phase 6 (journal d'activité)

Même exercice, sécurité comprise d'emblée, appliqué au Journal d'activité (§28), migration
SQL comprise (comparée ligne à ligne au schéma Prisma actuel pour `ActivityLog` — aucune
dérive trouvée).

Ce module est différent des précédents : ce n'est pas lui-même une surface exposée aux
visiteurs ou aux rôles à faibles privilèges (lecture réservée au Super Admin, aucune écriture
exposée par l'API — le journal n'est ni modifiable ni supprimable), mais un mécanisme
transversal (`ActivityLogInterceptor`, un intercepteur global) qui observe TOUTES les autres
routes d'administration. La revue de sécurité a donc porté sur sa complétude et sa fiabilité
en tant qu'outil d'audit, plutôt que sur un risque d'accès direct :

- **Une entrée n'est jamais écrite pour une action qui a échoué.** Vérifié explicitement :
  `tap()` (RxJS) ne s'exécute que lorsque la requête sous-jacente réussit ; une exception
  levée par un contrôleur/service (validation, permission refusée, ressource introuvable...)
  fait échouer l'`Observable` et n'exécute jamais le callback de journalisation — le journal
  ne peut donc pas laisser croire qu'une action bloquée par le RBAC a réussi.
- **Un échec d'écriture du journal ne peut jamais faire échouer l'action qu'il enregistre** :
  `ActivityLogService.record()` avale toute erreur Prisma et se contente de la journaliser
  côté serveur (`Logger.error`) — confirmé en lisant le code, conforme à ce qu'annonce le
  README.
- **Couverture des routes** : tous les contrôleurs d'administration exposent bien leurs
  routes sous `/admin/...` (vérifié sur l'ensemble des `@Controller(...)` du projet), ce dont
  dépend entièrement la détection de l'intercepteur (`segments.indexOf('admin')`) — aucune
  route de mutation admin ne s'en trouve donc exclue par accident.
- **Robustesse du filtre par période** (`/admin/journal?from=...&to=...`) : `from`/`to`
  n'étaient validés que comme des chaînes quelconques (`@IsString()`), alors que le service
  les passe directement à `new Date(...)` avant de les transmettre à Prisma — une valeur non
  parsable (paramètre malformé, ou modifié à la main dans l'URL) produisait une erreur Prisma
  non interceptée (500 brut) plutôt qu'un message de validation propre. Corrigé avec
  `@IsDateString()`, déjà utilisé ailleurs dans le projet pour ce type de champ (ex.
  `publishedAt` des actualités).

**Note pour une revue future, hors périmètre de cette phase :** en vérifiant que toutes les
routes de mutation admin sont bien sous `/admin/...` (donc bien couvertes par le journal), la
gestion des comptes administrateurs (`/admin/users`, phase 1) a été relue au passage.
`UpdateUserDto` regroupe le changement de rôle (`roleName`) avec les champs ordinaires
(nom, email, statut actif) sous la seule permission `users:update` — même schéma que celui
corrigé en phase 2 sur les promotions/produits/actualités/pages, où un champ sensible
partageait la permission générale au lieu d'une permission dédiée. Aujourd'hui, cela ne
change rien en pratique : seul le Super Admin détient une permission `users:*`, quelle
qu'elle soit (vérifié dans le seed), donc personne ne peut actuellement s'auto-promouvoir ou
promouvoir un tiers en Super Admin par ce biais. Mais si un rôle intermédiaire venait un jour
à recevoir `users:update` (par exemple pour permettre à un Gestionnaire de désactiver des
comptes sans lui donner tous les droits d'administration des comptes), rien n'empêcherait
alors ce rôle de s'accorder lui-même le rôle Super Admin. Cette anomalie appartient au
module Comptes administrateurs de la phase 1, pas à celui du journal d'activité : je ne l'ai
pas corrigée ici pour respecter le périmètre de cette phase, mais elle serait à traiter dans
un futur repassage ciblé sur les comptes administrateurs, si vous le souhaitez.

## Analyse d'ensemble (après les six phases)

Après avoir vérifié chaque phase individuellement, cette dernière passe porte sur le projet
dans son ensemble : les points qui ne se voient qu'en regardant transversalement (un même
type de champ répété dans plusieurs modules, un mécanisme partagé par plusieurs phases,
la configuration globale du serveur), plutôt que module par module.

**Trouvaille la plus importante, corrigée depuis : une fonctionnalité annoncée comme livrée
en phase 1 n'avait en réalité aucune interface.** Le README liste « Gestion des utilisateurs
administrateurs (créer/modifier/désactiver un compte) » parmi les livrables de la phase 1, et
l'API back-end (`/admin/users`, `UsersController`/`UsersService`) était bien complète et
fonctionnelle — mais il n'existait **aucune page `/admin/...` côté front-end** pour l'utiliser.
Ajoutée : `/admin/utilisateurs` (lien « Comptes » dans la navigation admin), avec liste des
comptes, création (nom/email/mot de passe/rôle), modification en ligne (nom/email/rôle),
activation/désactivation en un clic et suppression — en s'appuyant sur les deux garde-fous
ajoutés côté API ci-dessous (blocage de l'attribution du rôle Super Admin par un compte qui
ne l'est pas déjà, protection du dernier Super Admin actif), dont les messages d'erreur
remontent tels quels dans la page.

En construisant cette page, une limite supplémentaire est apparue, corrigée depuis :
`UpdateUserDto` ne permettait pas de changer le mot de passe d'un compte existant (seul
`CreateUserDto` en acceptait un, à la création). Un Super Admin ne pouvait donc pas
réinitialiser le mot de passe d'un collègue qui l'aurait oublié depuis le back-office — il
aurait fallu soit le supprimer et le recréer (perte de l'historique du journal d'activité
associé à son `userId`), soit passer par la base de données directement. Un champ `password`
optionnel a été ajouté à `UpdateUserDto` (même validation de longueur qu'à la création) : au
contraire du changement de rôle (`roleName`, voir juste en dessous), l'ajouter au DTO général
ne pose pas le même risque d'escalade de privilège, puisque `users:update` est déjà réservé au
seul Super Admin dans le seed — une route dédiée n'aurait rien isolé de plus ici. Toute
réinitialisation révoque également les sessions actives du compte (mêmes refresh tokens
révoqués qu'à une désactivation), pour qu'un ancien mot de passe compromis ne reste pas
utilisable via une session déjà ouverte. Exposé côté front dans `/admin/utilisateurs` (bouton
« Réinitialiser mdp » par ligne).

En creusant les mécanismes partagés par plusieurs modules, plusieurs anomalies de la même
famille que celles déjà corrigées phase par phase sont ressorties :

- **Comptes administrateurs (§3.2, phase 1) — promotion à Super Admin sans permission
  dédiée.** Signalé sans être corrigé à la fin de la phase 6 ; corrigé maintenant, dans le
  cadre de cette analyse globale. Le changement de rôle d'un compte (`roleName`) partageait
  la permission générale `users:update`/`users:create` avec les champs ordinaires (nom,
  email, statut), sans permission dédiée — même schéma que celui corrigé en phase 2 sur les
  promotions/produits/actualités/pages. Aujourd'hui, seul le Super Admin détient une
  permission `users:*`, donc rien n'était exploitable en pratique, mais rien n'aurait empêché
  un rôle intermédiaire, s'il recevait un jour `users:update` pour une raison plus limitée,
  de s'auto-promouvoir Super Admin. Corrigé : l'attribution du rôle SUPER_ADMIN à un compte
  exige désormais que l'appelant soit lui-même Super Admin.
- **Comptes administrateurs — absence de garde-fou contre l'auto-verrouillage.** À l'occasion
  du point précédent : rien n'empêchait de désactiver, rétrograder ou supprimer le DERNIER
  compte Super Admin actif, ce qui aurait rendu la gestion des comptes elle-même inaccessible
  à tout le monde (elle est, par design, réservée au Super Admin — voir phase 6). Corrigé en
  bloquant ces trois actions sur le dernier Super Admin actif restant.
- **Upload d'images (§21, partagé par Produits/Boutiques/Actualités/Pages/Promotions) —
  validation insuffisante du contenu réel du fichier.** Le filtre de type de fichier ne
  vérifiait que l'en-tête `Content-Type` déclaré par le client — une valeur purement
  déclarative, trivialement falsifiable — et l'extension du fichier enregistré sur le
  serveur était dérivée du **nom de fichier d'origine** envoyé par le client, indépendamment
  de ce `Content-Type`. Un compte disposant seulement de `media:upload` (un Éditeur, donc,
  pas forcément un Super Admin) pouvait ainsi faire enregistrer sur le serveur un fichier
  `.svg` (potentiellement porteur d'un script) sous `/uploads/...`, publiquement accessible.
  Le site public et l'API n'étant pas sur la même origine dans cette configuration (voir
  `CORS_ORIGIN`), ce n'est pas exploitable aujourd'hui pour voler les tokens `localStorage`
  du front-end — mais rien ne garantit que ça reste vrai dans tous les déploiements futurs.
  Corrigé : l'extension enregistrée est désormais dérivée du `Content-Type` validé (jamais du
  nom de fichier d'origine), et le contenu réel du fichier est vérifié après écriture
  (signature/« magic bytes » JPEG/PNG/WebP) — un fichier dont le contenu ne correspond pas
  au format annoncé est supprimé et rejeté.
- **Champs image/URL sans contrainte de forme, au-delà des Actualités/Pages déjà corrigées en
  phase 4.** La même faille (une URL externe arbitraire, au lieu du chemin `/uploads/...`
  attendu, fait planter le rendu `next/image` du site public — déni de service) existait
  aussi sur les images de Produits, de Boutiques, de Catégories, et sur le logo de Marques
  (ce dernier n'étant même affiché nulle part dans le front-end actuel — champ mort, comme
  `Promotion.bannerImage` avant son raccordement en phase 2). Corrigée partout de la même
  façon : chemin `/uploads/...` obligatoire.

Enfin, plusieurs points de configuration globale ont été vérifiés sans anomalie ou corrigés :

- `ValidationPipe` global (`whitelist: true, forbidNonWhitelisted: true`) : confirmé actif
  sur toute l'API, ce qui empêche déjà toute assignation de masse via un champ JSON
  supplémentaire non déclaré dans un DTO — une protection transversale qui limite justement
  la portée de la plupart des anomalies ci-dessus.
- CORS restreint à une origine unique configurable (`CORS_ORIGIN`), pas de wildcard `*`.
- Secrets : aucun fichier `.env` commité (seuls des `.env.example`), correctement exclus par
  les `.gitignore` du back-end et du front-end.
- Absence d'en-têtes de sécurité HTTP standard (`X-Content-Type-Options`,
  `X-Frame-Options`...) sur l'API — ajoutés via `helmet`.

## Ce qui n'est pas encore fait (phases suivantes)

Journal d'activité, gestion des médias dédiée (recherche/réutilisation d'images) — voir le
cahier des charges v2.0 pour le détail. Le modèle de données (`schema.prisma`) est conçu
pour accueillir ces entités sans tout casser (Order/OrderItem/Customer notamment sont
prévus mais pas encore branchés).

**Limites connues** :

- Le tri du catalogue par prix (`sort=price_asc/price_desc`) trie encore sur le prix normal
  en base, pas sur le prix effectif après promotion — un produit cher fortement soldé peut
  donc ne pas apparaître exactement où on l'attend en tri croissant. À corriger si besoin
  (colonne de prix effectif matérialisée, ou recalcul applicatif) dans une prochaine itération.
- Le §27 du cahier des charges prévoit un accès Gestionnaire aux boutiques « selon
  attribution » (uniquement les boutiques qui lui sont assignées). Cette granularité n'existe
  pas encore dans le modèle de données (il faudrait une table d'attribution boutique ↔
  utilisateur) : pour l'instant, tout Gestionnaire peut consulter et modifier toutes les
  boutiques, mais ne peut pas en créer ou en supprimer (ces deux actions restent réservées
  au Super Admin). À affiner si une vraie gestion par attribution est nécessaire.
- Le champ « Contenu » des Actualités et Pages (§20, §22 demandent un « éditeur de texte
  riche ») est aujourd'hui un simple champ texte où l'admin tape du HTML directement (les
  balises simples — paragraphes, gras, listes, titres `<h2>`, liens — sont affichées telles
  quelles sur le site). Il n'y a pas encore de véritable éditeur WYSIWYG dans le back-office
  : à ajouter (ex. TipTap, Quill) dans une prochaine itération sans changer le format de
  stockage (HTML) ni l'API.
- Le champ « Auteur » d'une Actualité est un texte libre, non lié aux comptes
  administrateurs existants (`User`) — plus simple à saisir, mais ne garantit pas la
  cohérence du nom d'un article à l'autre. De même, « Catégorie » est un texte libre plutôt
  qu'une vraie taxonomie ; à revoir si un filtrage par catégorie plus strict est nécessaire.
- Les slugs des Pages de contenu sont vérifiés contre une liste de segments réservés
  (`produits`, `boutiques`, `actualites`, `admin`...) pour ne pas entrer en conflit avec les
  routes existantes du site — une page nommée par exemple « Produits » sera refusée par
  l'API avec un message clair plutôt que de casser silencieusement une route.
- **Notifications en interne uniquement (pas d'email)** : le §29 du cahier des charges
  propose « email et/ou dans le dashboard » — cette phase implémente uniquement la partie
  dashboard (cloche + liste), car l'envoi d'email nécessite une configuration SMTP qui ne
  peut ni être configurée ni être testée dans cet environnement. L'envoi d'email (et le
  choix des destinataires, prévu au §24 Paramètres) est à ajouter dans une prochaine phase ;
  la structure du service `NotificationsService.create()` est déjà centralisée, donc
  brancher un envoi d'email en plus de l'enregistrement en base ne demandera pas de
  changement ailleurs dans le code.
- **Anti-spam du formulaire de contact** : le cahier des charges signale ce point comme
  « à valider selon le niveau de trafic attendu » (non tranché). Cette phase retient un
  défaut raisonnable — champ honeypot + limite de 5 messages par IP / 10 minutes — réglable
  via les deux constantes en tête de `backend/src/contact-messages/contact-messages.service.ts`
  (`RATE_LIMIT_WINDOW_MINUTES`, `RATE_LIMIT_MAX_MESSAGES`). Un vrai CAPTCHA (ex. hCaptcha,
  Turnstile) pourra remplacer ou compléter ce mécanisme si le trafic constaté le justifie.
- **Fiabilité de la limitation par IP derrière un proxy** : réglable désormais via la variable
  `TRUST_PROXY` (voir `.env.example` et le commentaire dans `backend/src/main.ts`) — laissée
  vide par défaut (pas de proxy dans cet environnement de développement), à définir (ex. `1`)
  uniquement si l'application est déployée derrière un reverse proxy ou un load balancer
  (Nginx, Cloudflare...), pour que `req.ip` reflète la vraie IP du visiteur plutôt que celle
  du proxy. Ceci concerne à la fois l'anti-spam du formulaire de contact (ci-dessus) et la
  limitation des tentatives de connexion (`/auth/login`, `/auth/refresh`).
- **Tokens d'authentification stockés dans `localStorage` côté navigateur** (`lib/auth.ts`) :
  choix simple qui évite la complexité d'un flux par cookies `httpOnly` + protection CSRF,
  mais qui expose les tokens à un vol par script en cas de faille XSS ailleurs sur le site
  (React échappe le contenu par défaut, ce qui limite ce risque tant qu'aucun
  `dangerouslySetInnerHTML` n'affiche du contenu non maîtrisé). Ce scénario n'était pas que
  théorique : la revue de la phase 4 a trouvé exactement ce cas sur les contenus HTML des
  Actualités/Pages et l'a corrigé par un assainissement à l'écriture (voir « Revue de code —
  phase 4 ») — mais ce nettoyage protège seulement ces deux champs précis, pas l'architecture
  dans son ensemble : tout futur champ affiché via `dangerouslySetInnerHTML` devra être
  assaini de la même façon. En durcissement ultérieur, on pourra aussi passer le refresh
  token en cookie `httpOnly`/`Secure`/`SameSite=Strict` et ajouter une protection CSRF sur
  les routes mutantes, pour ne plus dépendre uniquement de l'absence de XSS.
- **Le journal d'activité (§28) est dérivé automatiquement du chemin de la route**, pas
  déclenché explicitement par chaque service. Conséquence pratique : une nouvelle route
  `/admin/<ressource>/...` ajoutée dans une phase future est journalisée sans code
  supplémentaire tant qu'elle suit le même schéma d'URL ; en contrepartie, une route qui
  s'en écarterait (ex. une action groupée sur plusieurs ressources à la fois) apparaîtrait
  dans le journal avec une description générique plutôt qu'une phrase entièrement adaptée —
  à surveiller si un futur module a une forme d'URL inhabituelle.
- Le journal d'activité n'a pas de politique de purge : toutes les entrées s'accumulent
  indéfiniment. Sans volume important prévu à ce stade du projet, ce n'est pas un problème
  immédiat, mais une purge périodique (ex. conserver 12 mois) serait à prévoir avant une
  mise en production de longue durée.

## Prérequis

- Node.js 20 ou plus (18 minimum)
- PostgreSQL 14+ (local ou distant)
- npm

## Installation — Backend

```bash
cd backend
cp .env.example .env
# Modifier .env si besoin (mot de passe DB, secrets JWT...)

npm install
npx prisma generate
npx prisma migrate dev      # applique les migrations déjà écrites dans prisma/migrations
npm run prisma:seed         # crée les rôles, permissions, le compte Super Admin et des données de démo
                             # (promotions, boutique, actualité et pages de démonstration)

npm run start:dev           # démarre l'API sur http://localhost:3001/api
```

Compte Super Admin créé par le seed (modifiable dans `.env`) :
- Email : `admin@amzafuturtelecom.com`
- Mot de passe : `ChangeMoi123!`

**Change ce mot de passe dès le premier lancement en production.**

## Installation — Frontend

```bash
cd frontend
cp .env.local.example .env.local

npm install
npm run dev                 # démarre le site sur http://localhost:3000
```

- Site public : http://localhost:3000
- Espace admin : http://localhost:3000/admin/login

## Vérifier que tout fonctionne (test manuel)

1. Backend démarré + `prisma migrate dev` + `prisma:seed` exécutés.
2. Aller sur http://localhost:3000/admin/login et se connecter avec le compte Super Admin.
3. Créer une catégorie, une marque, puis un produit ; le publier.
4. Aller sur http://localhost:3000/produits : le produit publié doit apparaître.
5. Ouvrir sa fiche produit et cliquer sur « Commander sur WhatsApp » : un message
   pré-rempli doit s'ouvrir (remplacer le numéro `0000000000` dans le code par le vrai
   numéro WhatsApp d'Amza — recherche `wa.me/0000000000` dans le frontend).
6. Aller sur http://localhost:3000/admin/promotions : les deux promotions de démo
   (« Flash Sale Galaxy S25 » et « Promo Accessoires ») doivent apparaître avec le statut
   « Active ». Sur http://localhost:3000, la section « Promotions en cours » doit afficher
   leurs bannières, et les produits concernés doivent afficher un prix barré + badge de
   réduction dans le catalogue.
7. Aller sur http://localhost:3000/admin/boutiques : la boutique de démo « Amza Futur
   Telecom — Siège » doit apparaître, active. Sur http://localhost:3000, la section
   « Nos boutiques » doit l'afficher, et http://localhost:3000/boutiques doit lister ses
   coordonnées complètes.
8. Aller sur http://localhost:3000/admin/actualites et http://localhost:3000/admin/pages :
   l'actualité et les 4 pages de démo doivent apparaître, publiées. Sur
   http://localhost:3000, les blocs « Présentation de l'entreprise » et « Dernières
   actualités » doivent s'afficher, http://localhost:3000/actualites doit lister
   l'actualité, et http://localhost:3000/a-propos doit afficher la page « À propos ».
9. Aller sur http://localhost:3000/contact et envoyer un message : la page doit afficher la
   confirmation d'envoi. Se reconnecter à l'admin : la cloche 🔔 (à côté de « Déconnexion »)
   doit afficher un badge « 1 » (en plus du message de démo du seed), et
   http://localhost:3000/admin/messages doit lister le nouveau message avec le statut
   « Nouveau ». L'ouvrir doit le faire automatiquement passer à « Lu » ; le bouton
   « Marquer comme traité » doit le faire passer à « Traité ». Envoyer 6 messages de suite
   depuis la même IP en moins de 10 minutes doit déclencher une erreur « Trop de messages
   envoyés récemment ».
10. Aller sur http://localhost:3000/admin/journal : la connexion effectuée à l'étape 2 doit
    apparaître (action `LOGIN`), ainsi qu'une entrée pour chaque action faite depuis (création
    du produit, changement de statut du message, etc.). Filtrer par ressource « Produits »
    doit ne garder que les entrées liées au produit créé à l'étape 3.

## Points à savoir / limites assumées de cette phase

- **Stockage des images** : en local sur le disque du serveur backend (`backend/uploads/`).
  À remplacer par Cloudinary ou S3 en production (voir §21 et §31 du cahier des charges) —
  seul `media.service.ts` devra changer, l'API exposée au frontend ne bougera pas.
- **Protection des routes admin côté frontend** : vérification simple côté client
  (`AdminGuard`) qui redirige vers `/admin/login` si aucun token n'est présent. La vraie
  sécurité est appliquée côté API (JWT + permissions vérifiées sur chaque route). Une
  protection serveur plus robuste (cookies httpOnly + middleware Next.js) pourra être
  ajoutée dans une phase suivante.
- **Tests automatisés** : non inclus dans cette phase (à ajouter — voir §29/§30 de la
  revue du cahier des charges).

## Structure du projet

```
amza-futur-telecom/
  backend/                 # API NestJS + Prisma
    prisma/schema.prisma   # modèle de données (phases 1 à 6)
    prisma/seed.ts         # rôles, permissions, compte Super Admin, données de démo
    src/
      auth/                # JWT, RBAC, journalisation des connexions (phase 6)
      users/                # comptes administrateurs
      roles/                # liste des rôles (lecture seule)
      categories/ brands/ products/   # catalogue
      promotions/           # promotions/réductions (phase 2)
      boutiques/            # boutiques / points de vente (phase 3)
      articles/             # actualités (phase 4)
      pages/                # pages de contenu (phase 4)
      contact-messages/     # formulaire de contact (phase 5, §23)
      notifications/        # notifications internes back-office (phase 5, §29)
      activity-log/         # journal d'activité, intercepteur global (phase 6, §28)
      common/utils/          # calcul du prix effectif et du statut d'affichage des promotions
      media/                # upload d'images
      dashboard/            # statistiques admin
  frontend/                 # Next.js (App Router) + Tailwind
    app/(site)/             # site public (accueil, catalogue, fiche produit, boutiques, actualités, [slug], contact)
    app/admin/              # back-office (login, dashboard, produits, promotions, boutiques, actualités, pages, messages, journal, catégories, marques)
    lib/                    # client API (public + admin), auth, types partagés
    components/             # composants réutilisables (dont admin/NotificationBell.tsx)
```

## Prochaines étapes suggérées

1. Envoi d'email pour les notifications (en complément du dashboard) et écran de
   Paramètres (§24) pour configurer les destinataires.
2. Migration du stockage d'images vers Cloudinary/S3, environnements de déploiement (§36),
   et vraie gestion des médias (recherche/réutilisation, §21).
3. Éditeur de texte riche (WYSIWYG) pour les Actualités et Pages de contenu, au lieu du
   champ HTML brut actuel (voir « Limites connues » ci-dessus).
4. ~~Interface admin consciente des permissions~~ : fait pour les entrées de menu (`AdminNav`,
   via `lib/permissions.ts`) et les pages Catégories/Marques/Boutiques (formulaires de
   création et boutons Modifier/Supprimer masqués selon les permissions du rôle connecté,
   lues depuis le JWT). Les autres pages CRUD (Produits, Promotions, Actualités, Pages)
   n'ont pas ce problème en pratique : tous les rôles qui y ont accès ont soit toutes les
   permissions CRUD, soit aucune (donc la page entière est déjà masquée dans le menu) — à
   étendre si un rôle intermédiaire est introduit un jour sur ces ressources.
5. Correction du tri par prix pour tenir compte du prix effectif après promotion, et
   affinage de la gestion des boutiques « selon attribution ».
