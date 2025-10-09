-- DropIndex
DROP INDEX "public"."document_vector_idx";

-- AlterTable
ALTER TABLE "SearchResult" ADD COLUMN     "summary" TEXT NOT NULL DEFAULT '';
