-- Même cause que 20260914200000_add_missing_orders_tables : schema.prisma a évolué (référence
-- de suivi et réponse admin sur les messages de contact, type de notification NEW_ORDER) sans
-- qu'une migration correspondante ne soit jamais générée — invisible sur la base de
-- développement d'origine (déjà à jour via `db push`), mais bloquant en production : le
-- formulaire de contact public échouait avec une erreur 500 ("column reference does not
-- exist"), et une vraie commande aurait échoué de la même façon en créant sa notification
-- ("invalid input value for enum NotificationType: NEW_ORDER").

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'NEW_ORDER';

-- AlterTable
ALTER TABLE "contact_messages" ADD COLUMN     "reference" TEXT,
ADD COLUMN     "repliedAt" TIMESTAMP(3),
ADD COLUMN     "replyMessage" TEXT,
ADD COLUMN     "replyVoiceUrl" TEXT;

-- La table est vide en production au moment de cette migration, donc un simple UPDATE ne
-- backfille rien de réel — cette étape sert uniquement à satisfaire la contrainte NOT NULL
-- ci-dessous si jamais une ligne existait déjà (au lieu de faire échouer toute la migration).
UPDATE "contact_messages" SET "reference" = "id" WHERE "reference" IS NULL;

ALTER TABLE "contact_messages" ALTER COLUMN "reference" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_reference_key" ON "contact_messages"("reference");
