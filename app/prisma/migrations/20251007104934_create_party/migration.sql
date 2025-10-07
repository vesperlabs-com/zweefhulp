/*
  Warnings:

  - Added the required column `pageNumber` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "pageNumber" INTEGER NOT NULL,
ADD COLUMN     "programId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Party_name_key" ON "Party"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Program_fileName_key" ON "Program"("fileName");

-- CreateIndex
CREATE INDEX "Program_partyId_idx" ON "Program"("partyId");

-- CreateIndex
CREATE INDEX "Document_programId_idx" ON "Document"("programId");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
