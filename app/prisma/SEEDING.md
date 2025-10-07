# Database Seeding

This seeder processes all political party programs from PDFs and stores them in the database with embeddings for semantic search.

## Prerequisites

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the app directory with:
   ```
   DATABASE_URL="your-postgres-connection-string"
   OPENAI_API_KEY="your-openai-api-key"
   ```

3. **Ensure pgvector extension is enabled:**
   Your PostgreSQL database must have the `vector` extension installed. Most managed Postgres providers (Neon, Supabase, etc.) have this available.

## Running the Seeder

```bash
npx prisma db seed
```

Or manually:
```bash
tsx prisma/seed.ts
```

## What It Does

The seeder will:

1. **Create Party records** for each political party (VVD, PvdA, D66, etc.)
2. **Create Program records** for each PDF, linking it to the respective party
3. **Process each PDF:**
   - Load the PDF using LangChain's PDFLoader
   - Split text into chunks (~1000 characters with 200 character overlap)
   - Generate embeddings using Vercel AI SDK with OpenAI's `text-embedding-3-small` model
   - Store chunks with embeddings in the Document table

## Expected Output

For each party program:
- ✅ Party created/found
- ✅ Program created/found
- ✅ PDF loaded (shows page count)
- ✅ Text split into chunks
- ✅ Embeddings generated and stored

## Cost Estimate

Using `text-embedding-3-small`:
- Cost: ~$0.02 per 1M tokens
- Average program: ~50-200 pages = ~50-200k tokens
- Total for 18 programs: ~$0.10-$0.40

## Troubleshooting

**Error: OPENAI_API_KEY not set**
- Make sure you have a `.env` file with your OpenAI API key

**Error: vector type does not exist**
- Enable the pgvector extension in your database
- For Neon: It's automatically enabled
- For other providers: Run `CREATE EXTENSION vector;`

**Out of memory errors**
- The seeder processes programs sequentially to avoid memory issues
- If needed, comment out some programs in `seed.ts` and run multiple times
