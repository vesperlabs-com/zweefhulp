import { config } from 'dotenv'
import { PrismaClient } from '../src/generated/prisma'

// Load environment variables
config()

const prisma = new PrismaClient()

async function countPages() {
  console.log('📊 Counting pages across all programs...\n')
  
  // Get max page number per program
  const programs = await prisma.program.findMany({
    include: {
      party: true,
      documents: {
        select: { pageNumber: true },
        orderBy: { pageNumber: 'desc' },
        take: 1
      }
    }
  })
  
  let totalPages = 0
  
  console.log('Program breakdown:')
  for (const program of programs.sort((a, b) => a.party.name.localeCompare(b.party.name))) {
    const maxPage = program.documents[0]?.pageNumber || 0
    totalPages += maxPage
    console.log(`${program.party.name.padEnd(20)} - ${maxPage.toString().padStart(3)} pages`)
  }
  
  console.log(`\n📈 TOTAAL OVERZICHT`)
  console.log(`═══════════════════════════════════════`)
  console.log(`Totaal pagina's: ${totalPages.toLocaleString()}`)
  console.log(`Aantal programma's: ${programs.length}`)
  console.log(`Gemiddeld per programma: ${Math.round(totalPages / programs.length)} pagina's`)
  
  await prisma.$disconnect()
}

countPages()
  .then(() => console.log('\n✅ Done!'))
  .catch(console.error)
