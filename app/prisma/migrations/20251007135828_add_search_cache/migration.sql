-- CreateTable
CREATE TABLE "SearchResult" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "searchResultId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "ordinal" INTEGER NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchResult_query_idx" ON "SearchResult"("query");

-- CreateIndex
CREATE INDEX "SearchResult_partyId_idx" ON "SearchResult"("partyId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchResult_query_partyId_key" ON "SearchResult"("query", "partyId");

-- CreateIndex
CREATE INDEX "Position_searchResultId_idx" ON "Position"("searchResultId");

-- CreateIndex
CREATE INDEX "Quote_positionId_idx" ON "Quote"("positionId");

-- AddForeignKey
ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_searchResultId_fkey" FOREIGN KEY ("searchResultId") REFERENCES "SearchResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
