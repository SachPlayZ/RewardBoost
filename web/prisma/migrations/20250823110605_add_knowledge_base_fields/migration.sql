-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "knowledgeBaseEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "knowledgeBaseErrorMessage" TEXT,
ADD COLUMN     "knowledgeBaseId" TEXT,
ADD COLUMN     "knowledgeBaseManualText" TEXT,
ADD COLUMN     "knowledgeBasePdfFileName" TEXT,
ADD COLUMN     "knowledgeBasePdfUrl" TEXT,
ADD COLUMN     "knowledgeBaseStatus" TEXT;
