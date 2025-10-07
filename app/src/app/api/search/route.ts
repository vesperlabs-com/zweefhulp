import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { openai } from '@ai-sdk/openai'
import { embed, generateText } from 'ai'

const prisma = new PrismaClient()

// Party configurations
const PARTIES = [
  { name: 'GroenLinks-PvdA', short: 'GL-PvdA', website: 'https://groenlinks-pvda.nl' },
  { name: 'VVD', short: 'VVD', website: 'https://www.vvd.nl' },
  { name: 'PVV', short: 'PVV', website: 'https://www.pvv.nl' },
]

async function analyzeParty(
  query: string,
  partyName: string,
  partyShort: string,
  partyWebsite: string,
  vectorString: string
) {
  // Get party and program
  const party = await prisma.party.findUnique({
    where: { name: partyName },
    include: { programs: true }
  })

  if (!party || party.programs.length === 0) {
    return {
      party: partyName,
      short: partyShort,
      count: 0,
      website: partyWebsite,
      standpunten: []
    }
  }

  // Check cache first
  const cachedResult = await prisma.searchResult.findUnique({
    where: {
      query_partyId: {
        query,
        partyId: party.id
      }
    },
    include: {
      positions: {
        include: {
          quotes: {
            orderBy: { ordinal: 'asc' }
          }
        },
        orderBy: { ordinal: 'asc' }
      }
    }
  })

  // If cached, return formatted result
  if (cachedResult) {
    const standpunten = cachedResult.positions.map(pos => ({
      title: pos.title,
      subtitle: pos.subtitle,
      quotes: pos.quotes.map(q => ({
        text: q.text,
        page: q.page
      }))
    }))

    const count = standpunten.reduce((sum, s) => sum + s.quotes.length, 0)

    return {
      party: partyName,
      short: partyShort,
      count,
      website: partyWebsite,
      standpunten
    }
  }

  // Not cached, generate new results
  const program = party.programs[0]

  // Perform vector similarity search (top 50 chunks)
  const results = await prisma.$queryRaw<Array<{
    id: string
    content: string
    pageNumber: number
    similarity: number
  }>>`
    SELECT 
      id,
      content,
      "pageNumber",
      1 - (vector <=> ${vectorString}::vector) as similarity
    FROM "Document"
    WHERE "programId" = ${program.id}
    ORDER BY vector <=> ${vectorString}::vector
    LIMIT 50
  `

  // If no results found
  if (results.length === 0) {
    return {
      party: partyName,
      short: partyShort,
      count: 0,
      website: partyWebsite,
      standpunten: []
    }
  }

  // Prepare context for LLM
  const chunksContext = results.map((r, idx) => 
    `[${idx + 1}] (Pagina ${r.pageNumber}): ${r.content}`
  ).join('\n\n')

  const prompt = `Je bent een expert in het analyseren van politieke verkiezingsprogramma's. Je bent ZEER selectief en kritisch.

Hieronder staan tekst fragmenten uit het ${partyName} verkiezingsprogramma. De zoekopdracht is: "${query}"

${chunksContext}

KRITISCHE ANALYSE VEREIST:
1. Beoordeel elk fragment op echte relevantie voor "${query}". Vage of algemene uitspraken NIET includeren.
2. Identificeer alleen DUIDELIJK VERSCHILLENDE standpunten/posities. Als quotes hetzelfde zeggen, groepeer ze onder 1 standpunt.
3. Minder is meer! Lever ALLEEN standpunten die echt waardevol zijn.
4. Selecteer alleen de MEEST CONCRETE en INFORMATIEVE quotes (verbatim).

KWALITEIT BOVEN KWANTITEIT:
- Als er maar 1-2 echte standpunten zijn: geef alleen die
- Als fragmenten te vaag zijn: negeer ze
- Als quotes elkaar herhalen: kies de beste
- Maximaal 3 standpunten, maximaal 3 quotes per standpunt
- Als er NIETS echt relevants is: return lege array

STRUCTUUR VAN ELK STANDPUNT:

1. **Title (Titel)**: De concrete positie/het standpunt van de partij
   - Formuleer als een duidelijke positie of voorstel
   - Voorbeeld: "Meer sociale woningen bouwen" of "Verlaging van CO2-uitstoot verplichten"
   - Max 8 woorden
   - Vermijd vage termen als "aanpak" of "beleid"

2. **Subtitle (Ondertitel)**: De context of redenering
   - WAAROM neemt de partij dit standpunt in?
   - WELK probleem adresseert het?
   - HOE relateert het aan "${query}"?
   - Voorbeeld bij "Meer sociale woningen bouwen": "Om wachtlijsten te verkorten en betaalbaar wonen te garanderen"
   - Max 15 woorden
   - Voeg waarde toe, herhaal niet de titel

3. **Quotes**: VERBATIM bewijs uit het programma
   - Exacte citaten die dit standpunt ondersteunen
   - Concreet en informatief
   - Niet parafraseren!

VOORBEELD:
Slecht:
{
  "title": "Beleid voor woningmarkt",
  "subtitle": "De partij heeft plannen voor woningen"
}

Goed:
{
  "title": "100.000 sociale huurwoningen per jaar bijbouwen",
  "subtitle": "Om starter en middeninkomens toegang tot betaalbaar wonen te geven"
}

JSON formaat:
{
  "standpunten": [
    {
      "title": "...",
      "subtitle": "...",
      "quotes": [
        {
          "text": "exacte quote",
          "page": 42,
          "fragmentNumber": 5
        }
      ]
    }
  ]
}

STRIKTE REGELS:
- Quotes moeten EXACT matchen met brontekst
- Geen parafraseren of samenvatten
- GEEN DUPLICATE QUOTES - elke quote mag maar 1x voorkomen, ook niet over verschillende standpunten heen
- Titel = het standpunt, Subtitle = de context/redenering
- Alleen substantiële, concrete standpunten
- Bij twijfel: weglaten
- Antwoord ALLEEN met JSON, geen extra tekst`

  // Generate analysis with LLM (using GPT-4o for better reasoning)
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt,
    temperature: 0.2,
  })

  // Parse the LLM response
  let parsedResponse
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0])
    } else {
      parsedResponse = JSON.parse(text)
    }
  } catch (e) {
    console.error(`Failed to parse LLM response for ${partyName}:`, text)
    return {
      party: partyName,
      short: partyShort,
      count: 0,
      website: partyWebsite,
      standpunten: []
    }
  }

  // Deduplicate quotes across all standpunten
  const seenQuotes = new Set<string>()
  parsedResponse.standpunten = parsedResponse.standpunten.map((standpunt: any) => {
    const uniqueQuotes = standpunt.quotes.filter((quote: any) => {
      const key = `${quote.text.trim().toLowerCase()}|${quote.page}`
      if (seenQuotes.has(key)) {
        return false // Skip duplicate
      }
      seenQuotes.add(key)
      return true
    })
    return {
      ...standpunt,
      quotes: uniqueQuotes
    }
  }).filter((standpunt: any) => standpunt.quotes.length > 0) // Remove standpunten with no quotes left

  // Calculate total count (number of quotes)
  const totalCount = parsedResponse.standpunten.reduce(
    (sum: number, s: any) => sum + s.quotes.length,
    0
  )

  // Save to cache
  try {
    await prisma.searchResult.create({
      data: {
        query,
        partyId: party.id,
        positions: {
          create: parsedResponse.standpunten.map((standpunt: any, idx: number) => ({
            title: standpunt.title,
            subtitle: standpunt.subtitle,
            ordinal: idx + 1,
            quotes: {
              create: standpunt.quotes.map((quote: any, qIdx: number) => ({
                text: quote.text,
                page: quote.page,
                ordinal: qIdx + 1
              }))
            }
          }))
        }
      }
    })
  } catch (e) {
    console.error(`Failed to cache results for ${partyName}:`, e)
    // Continue even if caching fails
  }

  return {
    party: partyName,
    short: partyShort,
    count: totalCount,
    website: partyWebsite,
    standpunten: parsedResponse.standpunten
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // Generate embedding once for the search query
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    })

    const vectorString = `[${embedding.join(',')}]`

    // Analyze all parties in parallel
    const results = await Promise.all(
      PARTIES.map(party => 
        analyzeParty(query, party.name, party.short, party.website, vectorString)
      )
    )

    // Return all results
    return NextResponse.json({ parties: results })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
