-- CreateEnum
CREATE TYPE "StatutRappelRecours" AS ENUM ('ACTIF', 'EFFECTUE', 'EXPIRE');

-- CreateTable
CREATE TABLE "rappels_recours" (
    "id" TEXT NOT NULL,
    "affaireId" TEXT NOT NULL,
    "resultatAudienceId" TEXT,
    "dateLimite" TIMESTAMP(3) NOT NULL,
    "statut" "StatutRappelRecours" NOT NULL DEFAULT 'ACTIF',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createurId" TEXT NOT NULL,

    CONSTRAINT "rappels_recours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rappels_recours_resultatAudienceId_key" ON "rappels_recours"("resultatAudienceId");

-- CreateIndex
CREATE INDEX "rappels_recours_affaireId_idx" ON "rappels_recours"("affaireId");

-- CreateIndex
CREATE INDEX "rappels_recours_statut_idx" ON "rappels_recours"("statut");

-- CreateIndex
CREATE INDEX "rappels_recours_dateLimite_idx" ON "rappels_recours"("dateLimite");

-- AddForeignKey
ALTER TABLE "rappels_recours" ADD CONSTRAINT "rappels_recours_affaireId_fkey" FOREIGN KEY ("affaireId") REFERENCES "affaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rappels_recours" ADD CONSTRAINT "rappels_recours_resultatAudienceId_fkey" FOREIGN KEY ("resultatAudienceId") REFERENCES "resultats_audience"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rappels_recours" ADD CONSTRAINT "rappels_recours_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
