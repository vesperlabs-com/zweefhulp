import { PrismaClient } from '../src/generated/prisma'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'
import { join } from 'path'
import { PARTIES } from '../src/lib/party-data'

const prisma = new PrismaClient()

async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  })
  return embedding
}

async function processProgram(partyName: string, fileName: string) {
  const partyData = PARTIES[partyName]
  if (!partyData) {
    throw new Error(`Party "${partyName}" not found in party data`)
  }

  console.log(`\n📄 Processing ${partyName} - ${fileName}`)
  
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

  // Check if this program already exists
  const existingProgram = await prisma.program.findUnique({
    where: { fileName },
  })

  if (existingProgram) {
    console.log(`  ⚠️  Program with fileName "${fileName}" already exists. Skipping.`)
    return
  }

  // Create new program (doesn't delete old one)
  const program = await prisma.program.create({
    data: {
      fileName,
      year: partyData.program.year,
      partyId: party.id,
    },
  })

  console.log(`  ✅ Created new program entry (ID: ${program.id})`)

  // Load PDF with custom pdfjs
  const pdfPath = join(__dirname, '..', 'public', 'programs', fileName)
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

async function cleanupOldPrograms(partyName: string) {
  const partyData = PARTIES[partyName]
  if (!partyData) {
    throw new Error(`Party "${partyName}" not found in party data`)
  }

  const party = await prisma.party.findUnique({
    where: { name: partyName },
    include: { programs: true },
  })

  if (!party) {
    console.log(`  ⚠️  Party "${partyName}" not found in database`)
    return
  }

  // Find programs that are NOT the current one in party-data.ts
  const currentFileName = partyData.program.fileName
  const oldPrograms = party.programs.filter(p => p.fileName !== currentFileName)

  if (oldPrograms.length === 0) {
    console.log(`  ℹ️  No old programs to clean up for ${partyName}`)
    return
  }

  console.log(`\n🗑️  Cleaning up ${oldPrograms.length} old program(s) for ${partyName}`)
  
  for (const program of oldPrograms) {
    console.log(`  🗑️  Deleting program: ${program.fileName}`)
    await prisma.program.delete({
      where: { id: program.id },
    })
  }

  // Optionally clear search cache for this party
  const deletedSearchResults = await prisma.searchResult.deleteMany({
    where: { partyId: party.id },
  })

  console.log(`  🗑️  Cleared ${deletedSearchResults.count} cached search results`)
  console.log(`  ✅ Cleanup completed for ${partyName}`)
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('Usage:')
    console.error('  Reprocess party: pnpm reprocess-party <PartyName> <fileName>')
    console.error('  Cleanup old:     pnpm reprocess-party <PartyName> --cleanup-old')
    console.error('')
    console.error('Examples:')
    console.error('  pnpm reprocess-party GroenLinks-PvdA GroenLinks-PvdA-Verkiezingsprogramma-2025.pdf')
    console.error('  pnpm reprocess-party GroenLinks-PvdA --cleanup-old')
    process.exit(1)
  }

  const partyName = args[0]

  if (!PARTIES[partyName]) {
    console.error(`❌ Error: Party "${partyName}" not found.`)
    console.error(`Available parties: ${Object.keys(PARTIES).join(', ')}`)
    process.exit(1)
  }

  if (args[1] === '--cleanup-old') {
    // Cleanup mode
    await cleanupOldPrograms(partyName)
  } else if (args[1]) {
    // Reprocess mode
    const fileName = args[1]
    await processProgram(partyName, fileName)
    
    console.log('\n✨ Processing completed!')
    console.log('\n📋 Next steps:')
    console.log(`   1. Update party-data.ts to reference: ${fileName}`)
    console.log(`   2. Test the new program in production`)
    console.log(`   3. Run cleanup: pnpm reprocess-party ${partyName} --cleanup-old`)
  } else {
    console.error('❌ Error: Missing required argument')
    console.error('Usage: pnpm reprocess-party <PartyName> <fileName>')
    process.exit(1)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Script failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

