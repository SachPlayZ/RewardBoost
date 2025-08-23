/*
  Warnings:

  - You are about to drop the column `isActive` on the `campaigns` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "campaigns" DROP COLUMN "isActive",
ADD COLUMN     "blockchainCampaignId" TEXT,
ADD COLUMN     "blockchainTxHash" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';
