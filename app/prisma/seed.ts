import { PrismaClient } from '../src/generated/prisma'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'
import { join } from 'path'

const prisma = new PrismaClient()

// Party metadata
const PARTY_METADATA: Record<string, { shortName: string; website: string }> = {
  'BIJ1': { shortName: 'BIJ1', website: 'https://bij1.org' },
  'BBB': { shortName: 'BBB', website: 'https://www.boerburgerbeweging.nl' },
  'BVNL': { shortName: 'BVNL', website: 'https://bvnl.nl' },
  'CDA': { shortName: 'CDA', website: 'https://www.cda.nl' },
  'GroenLinks-PvdA': { shortName: 'GL-PvdA', website: 'https://groenlinks-pvda.nl' },
  'ChristenUnie': { shortName: 'CU', website: 'https://www.christenunie.nl' },
  'D66': { shortName: 'D66', website: 'https://d66.nl' },
  'PvdD': { shortName: 'PvdD', website: 'https://www.partijvoordedieren.nl' },
  'PVV': { shortName: 'PVV', website: 'https://www.pvv.nl' },
  'SP': { shortName: 'SP', website: 'https://www.sp.nl' },
  'FVD': { shortName: 'FvD', website: 'https://www.fvd.nl' },
  '50PLUS': { shortName: '50+', website: 'https://50pluspartij.nl' },
  'SGP': { shortName: 'SGP', website: 'https://www.sgp.nl' },
  'NSC': { shortName: 'NSC', website: 'https://www.nieuwsociaalcontract.nl' },
  'JA21': { shortName: 'JA21', website: 'https://ja21.nl' },
  'DENK': { shortName: 'DENK', website: 'https://bewegingdenk.nl' },
  'VVD': { shortName: 'VVD', website: 'https://www.vvd.nl' },
  'Volt': { shortName: 'Volt', website: 'https://www.voltnederland.org' },
}

// Mapping of PDF filenames to party information
const PARTY_PROGRAMS = [
  { party: 'BIJ1', fileName: '20250925_Programma_BIJ1_Losse-Pagina-2.pdf', year: 2025 },
  { party: 'BBB', fileName: 'BBB Verkiezingsprogramma TK25 - versie 20250830 -.pdf', year: 2025 },
  { party: 'BVNL', fileName: 'BVNL-verkiezingsprogramma-2025-2029.pdf', year: 2025 },
  { party: 'CDA', fileName: 'CDA-Verkiezingsprogramma-TK2025-Digitaal-DEFINHOUD.pdf', year: 2025 },
  { party: 'GroenLinks-PvdA', fileName: 'Conceptverkiezingsprogramma-GroenLinks-PvdA-2025.pdf', year: 2025 },
  { party: 'ChristenUnie', fileName: 'CU_Verkiezingsprogramma_2025.pdf', year: 2025 },
  { party: 'D66', fileName: 'D66-Concept-verkiezingsprogramma-2025-2030.pdf', year: 2025 },
  { party: 'PvdD', fileName: 'PVDD-programma-tweede-kamerverkiezingen-okt-2025.pdf', year: 2025 },
  { party: 'PVV', fileName: 'PVV_Programma_Digi_2025.pdf', year: 2025 },
  { party: 'SP', fileName: 'SP_Concept_Verkiezingsprogramma.pdf', year: 2025 },
  { party: 'FVD', fileName: 'verkiezingsprogramma_1509_2_ca4765c16c.pdf', year: 2025 },
  { party: '50PLUS', fileName: 'Verkiezingsprogramma_2025-2029_50PLUS.pdf', year: 2025 },
  { party: 'SGP', fileName: 'Verkiezingsprogramma_SGP_2025 eindversie.pdf', year: 2025 },
  { party: 'NSC', fileName: 'Verkiezingsprogramma_TK_25_A4_v15.pdf', year: 2025 },
  { party: 'JA21', fileName: 'verkiezingsprogramma-2025.pdf', year: 2025 },
  { party: 'DENK', fileName: 'Verkiezingsprogramma-DENK-2025.pdf', year: 2025 },
  { party: 'VVD', fileName: 'Verkiezingsprogramma-TK-VVD-2025-DEF.pdf', year: 2025 },
  { party: 'Volt', fileName: 'volt_verkiezingsprogramma_2025.pdf', year: 2025 },
]

async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  })
  return embedding
}

async function processProgram(partyName: string, fileName: string, year: number) {
  console.log(`\n📄 Processing ${partyName} - ${fileName}`)

  // Get party metadata
  const metadata = PARTY_METADATA[partyName]
  
  // Create or get party with metadata
  const party = await prisma.party.upsert({
    where: { name: partyName },
    update: {
      shortName: metadata?.shortName,
      website: metadata?.website,
    },
    create: {
      name: partyName,
      shortName: metadata?.shortName,
      website: metadata?.website,
    },
  })

  // Create or get program
  const program = await prisma.program.upsert({
    where: { fileName },
    update: {},
    create: {
      fileName,
      year,
      partyId: party.id,
    },
  })

  // Load PDF with custom pdfjs
  const pdfPath = join(__dirname, '..', 'programs', fileName)
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

  for (const { party, fileName, year } of PARTY_PROGRAMS) {
    try {
      await processProgram(party, fileName, year)
    } catch (error) {
      console.error(`❌ Error processing ${party}:`, error)
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
