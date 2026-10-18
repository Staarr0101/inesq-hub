-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'NEEDS_CORRECTION', 'VERIFIED');

-- CreateEnum
CREATE TYPE "DocumentBatchStatus" AS ENUM ('RECEIVED', 'IN_REVIEW', 'COMPLETED');

-- CreateTable
CREATE TABLE "DocumentBatch" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "status" "DocumentBatchStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectorId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "DocumentBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'RECEIVED',
    "duplicateReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "batchId" TEXT,
    "sectorId" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentBatch_sectorId_createdAt_idx" ON "DocumentBatch"("sectorId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentBatch_createdByUserId_createdAt_idx" ON "DocumentBatch"("createdByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "DocumentBatch_status_createdAt_idx" ON "DocumentBatch"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- CreateIndex
CREATE INDEX "Document_sectorId_receivedAt_idx" ON "Document"("sectorId", "receivedAt");

-- CreateIndex
CREATE INDEX "Document_sectorId_sha256_idx" ON "Document"("sectorId", "sha256");

-- CreateIndex
CREATE INDEX "Document_status_receivedAt_idx" ON "Document"("status", "receivedAt");

-- CreateIndex
CREATE INDEX "Document_uploadedByUserId_receivedAt_idx" ON "Document"("uploadedByUserId", "receivedAt");

-- CreateIndex
CREATE INDEX "Document_reviewedByUserId_reviewedAt_idx" ON "Document"("reviewedByUserId", "reviewedAt");

-- AddForeignKey
ALTER TABLE "DocumentBatch" ADD CONSTRAINT "DocumentBatch_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentBatch" ADD CONSTRAINT "DocumentBatch_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "DocumentBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
