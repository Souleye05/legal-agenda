/*
  Warnings:

  - You are about to drop the column `caseId` on the `parties` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `parties` table. All the data in the column will be lost.
  - You are about to drop the `alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hearing_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hearings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `affaireId` to the `parties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `parties` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `parties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('ADMIN', 'COLLABORATEUR');

-- CreateEnum
CREATE TYPE "StatutAffaire" AS ENUM ('ACTIVE', 'CLOTUREE', 'RADIEE');

-- CreateEnum
CREATE TYPE "RolePartie" AS ENUM ('DEMANDEUR', 'DEFENDEUR', 'CONSEIL_ADVERSE');

-- CreateEnum
CREATE TYPE "StatutAudience" AS ENUM ('A_VENIR', 'TENUE', 'NON_RENSEIGNEE');

-- CreateEnum
CREATE TYPE "TypeAudience" AS ENUM ('MISE_EN_ETAT', 'PLAIDOIRIE', 'REFERE', 'EVOCATION', 'CONCILIATION', 'MEDIATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeResultat" AS ENUM ('RENVOI', 'RADIATION', 'DELIBERE');

-- CreateEnum
CREATE TYPE "StatutAlerte" AS ENUM ('EN_ATTENTE', 'ENVOYEE', 'RESOLUE');

-- CreateEnum
CREATE TYPE "ActionAudit" AS ENUM ('CREATION', 'MODIFICATION', 'SUPPRESSION');

-- DropForeignKey
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_hearingId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "cases" DROP CONSTRAINT "cases_createdById_fkey";

-- DropForeignKey
ALTER TABLE "hearing_results" DROP CONSTRAINT "hearing_results_createdById_fkey";

-- DropForeignKey
ALTER TABLE "hearing_results" DROP CONSTRAINT "hearing_results_hearingId_fkey";

-- DropForeignKey
ALTER TABLE "hearings" DROP CONSTRAINT "hearings_caseId_fkey";

-- DropForeignKey
ALTER TABLE "hearings" DROP CONSTRAINT "hearings_createdById_fkey";

-- DropForeignKey
ALTER TABLE "parties" DROP CONSTRAINT "parties_caseId_fkey";

-- DropIndex
DROP INDEX "parties_caseId_idx";

-- AlterTable
ALTER TABLE "parties" DROP COLUMN "caseId",
DROP COLUMN "name",
ADD COLUMN     "affaireId" TEXT NOT NULL,
ADD COLUMN     "nom" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "RolePartie" NOT NULL;

-- DropTable
DROP TABLE "alerts";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "cases";

-- DropTable
DROP TABLE "hearing_results";

-- DropTable
DROP TABLE "hearings";

-- DropTable
DROP TABLE "system_config";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "AlertStatus";

-- DropEnum
DROP TYPE "AuditAction";

-- DropEnum
DROP TYPE "CaseStatus";

-- DropEnum
DROP TYPE "HearingResultType";

-- DropEnum
DROP TYPE "HearingStatus";

-- DropEnum
DROP TYPE "HearingType";

-- DropEnum
DROP TYPE "PartyRole";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "role" "RoleUtilisateur" NOT NULL DEFAULT 'COLLABORATEUR',
    "estActif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affaires" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "juridiction" TEXT NOT NULL,
    "chambre" TEXT NOT NULL,
    "ville" TEXT,
    "statut" "StatutAffaire" NOT NULL DEFAULT 'ACTIVE',
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createurId" TEXT NOT NULL,

    CONSTRAINT "affaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audiences" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heure" TEXT,
    "type" "TypeAudience" NOT NULL,
    "statut" "StatutAudience" NOT NULL DEFAULT 'A_VENIR',
    "notesPreparation" TEXT,
    "estPreparee" BOOLEAN NOT NULL DEFAULT false,
    "affaireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createurId" TEXT NOT NULL,

    CONSTRAINT "audiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultats_audience" (
    "id" TEXT NOT NULL,
    "type" "TypeResultat" NOT NULL,
    "nouvelleDate" TIMESTAMP(3),
    "motifRenvoi" TEXT,
    "motifRadiation" TEXT,
    "texteDelibere" TEXT,
    "audienceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createurId" TEXT NOT NULL,

    CONSTRAINT "resultats_audience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertes" (
    "id" TEXT NOT NULL,
    "audienceId" TEXT NOT NULL,
    "statut" "StatutAlerte" NOT NULL DEFAULT 'EN_ATTENTE',
    "nombreEnvois" INTEGER NOT NULL DEFAULT 0,
    "dernierEnvoiLe" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resoleLe" TIMESTAMP(3),

    CONSTRAINT "alertes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_audit" (
    "id" TEXT NOT NULL,
    "typeEntite" TEXT NOT NULL,
    "idEntite" TEXT NOT NULL,
    "action" "ActionAudit" NOT NULL,
    "ancienneValeur" TEXT,
    "nouvelleValeur" TEXT,
    "utilisateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration_systeme" (
    "id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_systeme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "affaires_reference_key" ON "affaires"("reference");

-- CreateIndex
CREATE INDEX "affaires_statut_idx" ON "affaires"("statut");

-- CreateIndex
CREATE INDEX "affaires_reference_idx" ON "affaires"("reference");

-- CreateIndex
CREATE INDEX "audiences_affaireId_idx" ON "audiences"("affaireId");

-- CreateIndex
CREATE INDEX "audiences_date_idx" ON "audiences"("date");

-- CreateIndex
CREATE INDEX "audiences_statut_idx" ON "audiences"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "resultats_audience_audienceId_key" ON "resultats_audience"("audienceId");

-- CreateIndex
CREATE INDEX "resultats_audience_audienceId_idx" ON "resultats_audience"("audienceId");

-- CreateIndex
CREATE INDEX "alertes_audienceId_idx" ON "alertes"("audienceId");

-- CreateIndex
CREATE INDEX "alertes_statut_idx" ON "alertes"("statut");

-- CreateIndex
CREATE INDEX "journal_audit_typeEntite_idEntite_idx" ON "journal_audit"("typeEntite", "idEntite");

-- CreateIndex
CREATE INDEX "journal_audit_utilisateurId_idx" ON "journal_audit"("utilisateurId");

-- CreateIndex
CREATE INDEX "journal_audit_createdAt_idx" ON "journal_audit"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "configuration_systeme_cle_key" ON "configuration_systeme"("cle");

-- CreateIndex
CREATE INDEX "parties_affaireId_idx" ON "parties"("affaireId");

-- AddForeignKey
ALTER TABLE "affaires" ADD CONSTRAINT "affaires_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audiences" ADD CONSTRAINT "audiences_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audiences" ADD CONSTRAINT "audiences_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_audience" ADD CONSTRAINT "resultats_audience_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "audiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_audience" ADD CONSTRAINT "resultats_audience_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "audiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_audit" ADD CONSTRAINT "journal_audit_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
