/*
  Warnings:

  - You are about to drop the column `statut` on the `rappels_recours` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "rappels_recours_statut_idx";

-- AlterTable
ALTER TABLE "rappels_recours" DROP COLUMN "statut",
ADD COLUMN     "dateEffectue" TIMESTAMP(3),
ADD COLUMN     "estEffectue" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "StatutRappelRecours";

-- CreateIndex
CREATE INDEX "rappels_recours_estEffectue_idx" ON "rappels_recours"("estEffectue");
