-- AlterTable
ALTER TABLE "audiences" ADD COLUMN     "dateRappelEnrolement" TIMESTAMP(3),
ADD COLUMN     "rappelEnrolement" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "audiences_rappelEnrolement_dateRappelEnrolement_idx" ON "audiences"("rappelEnrolement", "dateRappelEnrolement");
