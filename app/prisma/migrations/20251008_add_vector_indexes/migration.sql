-- AlterTable: Update vector column to have dimensions
ALTER TABLE "Document" ALTER COLUMN vector TYPE vector(1536);

-- CreateIndex: Add ivfflat index for fast vector similarity search
-- This index uses cosine distance and 100 lists for optimal performance
-- with your dataset size (~10-20k documents)
-- Note: Not using CONCURRENTLY because Prisma runs migrations in transactions
CREATE INDEX IF NOT EXISTS "document_vector_idx" 
ON "Document" USING ivfflat (vector vector_cosine_ops)
WITH (lists = 100);

-- Note: The programId index already exists from previous migrations

