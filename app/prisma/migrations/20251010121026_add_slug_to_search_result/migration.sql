-- AlterTable
ALTER TABLE "SearchResult" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';

-- Backfill slug values from query field (using PostgreSQL functions for slugification)
UPDATE "SearchResult" 
SET "slug" = regexp_replace(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        lower(trim("query")),
        '[^a-z0-9\s-]', '', 'g'  -- Remove non-alphanumeric except spaces and hyphens
      ),
      '\s+', '-', 'g'  -- Replace spaces with hyphens
    ),
    '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
  ),
  '^-|-$', '', 'g'  -- Remove leading/trailing hyphens
);

-- CreateIndex
CREATE INDEX "SearchResult_slug_idx" ON "SearchResult"("slug");

