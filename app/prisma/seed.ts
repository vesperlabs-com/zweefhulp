import { PrismaClient } from '../src/generated/prisma'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'
import { join } from 'path'
import { PARTIES, getPartiesList } from '../src/lib/party-data'

const prisma = new PrismaClient()

async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  })
  return embedding
}

async function processProgram(partyName: string) {
  const partyData = PARTIES[partyName]
  console.log(`\n📄 Processing ${partyName} - ${partyData.program.fileName}`)
  
  // Create or get party with metadata
  const party = await prisma.party.upsert({
    where: { name: partyName },
    update: {
      shortName: partyData.shortName,
      website: partyData.website,
    },
    create: {
      name: partyName,
      shortName: partyData.shortName,
      website: partyData.website,
    },
  })

  // Create or get program
  const program = await prisma.program.upsert({
    where: { fileName: partyData.program.fileName },
    update: {},
    create: {
      fileName: partyData.program.fileName,
      year: partyData.program.year,
      partyId: party.id,
    },
  })

  // Load PDF with custom pdfjs
  const pdfPath = join(__dirname, '..', 'programs', partyData.program.fileName)
  const loader = new PDFLoader(pdfPath, {
    pdfjs: () => import('pdfjs-dist'),
  })
  const docs = await loader.load()

  console.log(`  📚 Loaded ${docs.length} pages`)

  // Split text into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })

  const chunks = await textSplitter.splitDocuments(docs)
  console.log(`  ✂️  Split into ${chunks.length} chunks`)

  // Process each chunk
  let processedCount = 0
  for (const chunk of chunks) {
    const pageNumber = chunk.metadata.loc?.pageNumber || 1

    // Generate embedding
    const embedding = await generateEmbedding(chunk.pageContent)

    // Convert embedding to Postgres vector format
    const vectorString = `[${embedding.join(',')}]`

    // Store in database using raw SQL for vector type
    await prisma.$executeRaw`
      INSERT INTO "Document" (id, content, vector, "programId", "pageNumber")
      VALUES (
        gen_random_uuid()::text,
        ${chunk.pageContent},
        ${vectorString}::vector,
        ${program.id},
        ${pageNumber}
      )
    `

    processedCount++
    if (processedCount % 10 === 0) {
      console.log(`  ⏳ Processed ${processedCount}/${chunks.length} chunks`)
    }
  }

  console.log(`  ✅ Completed ${partyName}: ${processedCount} documents created`)
}

async function main() {
  console.log('🌱 Starting database seeding...\n')

  const parties = getPartiesList()
  
  for (const partyName of parties) {
    try {
      await processProgram(partyName)
    } catch (error) {
      console.error(`❌ Error processing ${partyName}:`, error)
      // Continue with next party instead of failing completely
    }
  }

  console.log('\n✨ Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
