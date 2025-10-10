import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { embed, generateText } from 'ai'
import { prisma } from '@/lib/prisma-edge'
import { cleanQuery, validateQuery } from '@/lib/search-guardrails'
import { getCachedSearchResults } from '@/lib/search-cache'
import { slugify } from '@/lib/slugify'

/**
 * Parse markdown format to positions structure
 * Expected format:
 * ### Samenvatting
 * Summary text here (3-4 sentences)
 * 
 * ## Heading
 * Explanation paragraph
 * - "quote" (pagina X)
 * - "quote" (pagina Y)
 */
function parseMarkdownToPositions(markdown: string): { 
  summary: string
  positions: Array<{
    title: string
    subtitle: string
    quotes: Array<{ text: string; page: number }>
  }> 
} {
  // Extract summary (### Samenvatting section)
  let summary = ''
  const summaryMatch = markdown.match(/###\s*Samenvatting\s*\n([\s\S]*?)(?=\n##|$)/)
  if (summaryMatch) {
    summary = summaryMatch[1].trim()
  }

  const positions: Array<{
    title: string
    subtitle: string
    quotes: Array<{ text: string; page: number }>
  }> = []

  // Split by ## headings (level 2)
  const sections = markdown.split(/^##\s+/m).filter(s => s.trim().length > 0)

  for (const section of sections) {
    const lines = section.trim().split('\n')
    if (lines.length === 0) continue

    // First line is the title
    const title = lines[0].trim()
    
    // Find where quotes start (lines starting with -)
    const firstQuoteIndex = lines.findIndex(line => line.trim().startsWith('-'))
    
    if (firstQuoteIndex === -1) {
      // No quotes found, skip this section
      continue
    }

    // Everything between title and first quote is the subtitle
    const subtitleLines = lines.slice(1, firstQuoteIndex)
      .map(l => l.trim())
      .filter(l => l.length > 0)
    const subtitle = subtitleLines.join(' ')

    // Parse quotes (lines starting with -)
    const quotes: Array<{ text: string; page: number }> = []
    
    for (let i = firstQuoteIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line.startsWith('-')) continue

      // Match: - "quote text" (pagina X)
      const quoteMatch = line.match(/^-\s*"([^"]+)"\s*\(pagina\s+(\d+)\)/)
      if (quoteMatch) {
        quotes.push({
          text: quoteMatch[1].trim(),
          page: parseInt(quoteMatch[2], 10)
        })
      }
    }

    // Only add position if it has quotes
    if (quotes.length > 0 && title && subtitle) {
      positions.push({
        title,
        subtitle,
        quotes
      })
    }
  }

  return { summary, positions }
}

async function analyzeParty(
  query: string,
  partyId: string,
  vectorString: string
) {
  // Get party with metadata and program
  const party = await prisma.party.findUnique({
    where: { id: partyId },
    include: { programs: true }
  })

  if (!party || party.programs.length === 0) {
    return {
      party: party?.name || 'Unknown',
      short: party?.shortName || 'Unknown',
      count: 0,
      website: party?.website || '#',
      summary: '',
      positions: []
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
    const positions = cachedResult.positions.map(pos => ({
      title: pos.title,
      subtitle: pos.subtitle,
      quotes: pos.quotes.map(q => ({
        text: q.text,
        page: q.page
      }))
    }))

    const count = positions.reduce((sum, s) => sum + s.quotes.length, 0)

    return {
      party: party.name,
      short: party.shortName || party.name,
      count,
      website: party.website || '#',
      summary: cachedResult.summary,
      positions
    }
  }

  // Not cached, generate new results
  const program = party.programs[0]

  // Perform vector similarity search (top 30 chunks)
  // Uses ivfflat index for fast approximate nearest neighbor search
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
    LIMIT 30
  `

  // If no results found
  if (results.length === 0) {
    return {
      party: party.name,
      short: party.shortName || party.name,
      count: 0,
      website: party.website || '#',
      summary: '',
      positions: []
    }
  }

  // Prepare context for LLM
  const chunksContext = results.map((r, idx) => 
    `[Fragment ${idx + 1}, Pagina ${r.pageNumber}]: ${r.content}`
  ).join('\n\n')

  const prompt = `Je bent een expert in het analyseren van politieke verkiezingsprogramma's. Je bent ZEER selectief, kritisch, en objectief.

Hieronder staan tekst fragmenten uit het ${party.name} verkiezingsprogramma. De zoekopdracht is: "${query}"

${chunksContext}

EERSTE STAP - SCHRIJF EEN SAMENVATTING:
Begin je antwoord met een "### Samenvatting" sectie van 2-3 zinnen die:
1. Het algemene standpunt van ${party.name} over "${query}" samenvat
2. De belangrijkste concrete beleidsvoorstellen noemt
3. De kern van hun visie helder maakt
4. Toegankelijk en begrijpelijk is voor kiezers

Voorbeeld formaat:
### Samenvatting
[3-4 zinnen hier die het standpunt synthetiseren en de belangrijkste voorstellen benoemen]

TWEEDE STAP - KRITISCHE ANALYSE VEREIST:
1. Beoordeel elk fragment op echte relevantie voor "${query}". Vage of algemene uitspraken NIET includeren.
2. Identificeer DUIDELIJK VERSCHILLENDE standpunten/posities over "${query}"
3. Als quotes hetzelfde zeggen of hetzelfde aspect behandelen: groepeer ze onder 1 standpunt
4. Minder is meer! Lever ALLEEN standpunten die echt waardevol en onderscheidend zijn
5. Selecteer alleen de MEEST CONCRETE en INFORMATIEVE quotes (verbatim, max 1-2 zinnen per quote)

KWALITEIT BOVEN KWANTITEIT:
- Als er maar 1-2 echte standpunten zijn: geef alleen die
- Als fragmenten te vaag zijn: negeer ze
- Als quotes elkaar herhalen: kies de beste en groepeer onder 1 standpunt
- Als er NIETS echt relevants is: geef geen standpunten

STANDPUNTEN GROEPEREN:
Groepeer quotes logisch onder verschillende standpunten als ze over verschillende aspecten gaan:
- Verschillende voorstellen/beleidsmaatregelen
- Verschillende problemen die worden geadresseerd
- Verschillende invalshoeken of perspectieven
- Korte termijn vs lange termijn maatregelen
- Verschillende doelgroepen

ELK STANDPUNT HEEFT:
1. **Heading (##)**: De concrete positie/het voorstel (max 8 woorden)
   - Formuleer als duidelijke positie: "Meer sociale woningen bouwen" niet "Beleid voor woningen"
   - Vermijd vage termen als "aanpak" of "beleid"

2. **Uitleg (2-3 zinnen)**: Context en redenering
   - WAAROM neemt de partij dit standpunt in?
   - WELK probleem adresseert het?
   - HOE relateert het specifiek aan "${query}"?
   - Voeg waarde toe, herhaal niet alleen de heading

3. **Quotes (bulletlijst)**: VERBATIM bewijs
   - Elk citaat exact uit het programma (max 1-2 zinnen)
   - Formaat: - "exacte tekst" (pagina X)
   - GEEN parafrase of interpretatie!
   - Alleen quotes die dit specifieke standpunt ondersteunen

VERPLICHTE markdown structuur:
### Samenvatting

[2-3 zinnen die het algemene standpunt en belangrijkste voorstellen samenvatten]

## [Standpunt 1 titel]

[Korte uitleg over dit standpunt in 2-3 zinnen, met context en redenering]

- "Exact citaat dat dit standpunt ondersteunt" (pagina X)
- "Ander exact citaat over dit specifieke aspect" (pagina Y)

## [Standpunt 2 titel - alleen als DUIDELIJK ANDERS]

[Korte uitleg over dit andere standpunt]

- "Exact citaat" (pagina Z)

BELANGRIJK:
- Quotes moeten LETTERLIJK uit de fragmenten komen
- Geen duplicate quotes over standpunten heen
- Alleen substantiële, concrete standpunten
- Bij twijfel: weglaten

Antwoord ALLEEN met markdown, geen extra tekst.`

  // Generate analysis with LLM
  const { text } = await generateText({
    model: openai('gpt-4.1'),
    prompt,
    temperature: 0.1,
  })

  // Parse the markdown response
  let parsedResponse
  try {
    parsedResponse = parseMarkdownToPositions(text)
  } catch (e) {
    console.error(`Failed to parse markdown response for ${party.name}:`, e)
    return {
      party: party.name,
      short: party.shortName || party.name,
      count: 0,
      website: party.website || '#',
      summary: '',
      positions: []
    }
  }

  // Deduplicate quotes across all positions
  const seenQuotes = new Set<string>()
  parsedResponse.positions = (parsedResponse.positions || []).map((position: any) => {
    const uniqueQuotes = (position.quotes || []).filter((quote: any) => {
      const key = `${quote.text.trim().toLowerCase()}|${quote.page}`
      if (seenQuotes.has(key)) {
        return false // Skip duplicate
      }
      seenQuotes.add(key)
      return true
    })
    return {
      ...position,
      quotes: uniqueQuotes
    }
  }).filter((position: any) => position.quotes?.length > 0) // Remove positions with no quotes left

  // Calculate total count (number of quotes)
  const totalCount = parsedResponse.positions.reduce(
    (sum: number, s: any) => sum + (s.quotes?.length || 0),
    0
  )

  // Save to cache
  try {
    await prisma.searchResult.create({
      data: {
        query,
        slug: slugify(query),
        partyId: party.id,
        summary: parsedResponse.summary,
        positions: {
          create: parsedResponse.positions.map((position: any, idx: number) => ({
            title: position.title,
            subtitle: position.subtitle,
            ordinal: idx + 1,
            quotes: {
              create: position.quotes.map((quote: any, qIdx: number) => ({
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
    console.error(`Failed to cache results for ${party.name}:`, e)
    // Continue even if caching fails
  }

  return {
    party: party.name,
    short: party.shortName || party.name,
    count: totalCount,
    website: party.website || '#',
    summary: parsedResponse.summary,
    positions: parsedResponse.positions
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rawQuery = searchParams.get('q')

    if (!rawQuery) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // Clean the query (trim + enforce 500 char limit)
    const query = cleanQuery(rawQuery)

    if (query.length === 0) {
      return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 })
    }

    // Check if we have cached results for all parties
    const cachedResults = await getCachedSearchResults(query)
    
    if (cachedResults) {
      // All parties are cached, return immediately without validation
      return NextResponse.json({ parties: cachedResults.parties, query: cachedResults.query })
    }

    // Not fully cached, validate the query before running expensive LLM operations
    const validation = await validateQuery(query)
    
    if (!validation.isValid) {
      const funnyErrors = [
        'Dit past niet in het regeerakkoord...',
        'De Tweede Kamer is in reces voor deze vraag...',
        'Zelfs de oppositie zou hier niet over debatteren...',
        'Dit valt buiten de portefeuille van alle ministers...',
        'De coalitie kan hier geen meerderheid voor vinden...',
        'Zelfs de formateur zou dit afwijzen...',
        'Hier heeft niemand een actieve herinnering aan...'
      ]
      
      const randomError = funnyErrors[Math.floor(Math.random() * funnyErrors.length)]
      
      return NextResponse.json(
        { 
          error: randomError,
          description: 'Probeer een geldige zoekterm over politiek, beleid, of maatschappelijke onderwerpen.'
        },
        { status: 400 }
      )
    }

    // Query is valid, proceed with normal flow
    // Fetch all parties from database
    const parties = await prisma.party.findMany()

    // Generate embedding once for the search query
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    })

    const vectorString = `[${embedding.join(',')}]`

    // Analyze all parties in parallel
    const results = await Promise.all(
      parties.map(party => 
        analyzeParty(query, party.id, vectorString)
      )
    )

    // Return all results with the query
    return NextResponse.json({ parties: results, query })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
