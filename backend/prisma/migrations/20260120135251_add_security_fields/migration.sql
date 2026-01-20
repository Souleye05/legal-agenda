/*
  Warnings:

  - A unique constraint covering the columns `[passwordResetToken]` on the table `utilisateurs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginIp" TEXT,
ADD COLUMN     "lastLoginUserAgent" TEXT,
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_passwordResetToken_key" ON "utilisateurs"("passwordResetToken");
