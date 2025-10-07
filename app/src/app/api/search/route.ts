import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { openai } from '@ai-sdk/openai'
import { embed, generateText } from 'ai'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    // Step 1: Get GroenLinks-PvdA party and program
    const party = await prisma.party.findUnique({
      where: { name: 'GroenLinks-PvdA' },
      include: {
        programs: true
      }
    })

    if (!party || party.programs.length === 0) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 })
    }

    const program = party.programs[0]

    // Step 2: Generate embedding for the search query
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    })

    // Step 3: Perform vector similarity search
    // Get top 50 most similar chunks
    const vectorString = `[${embedding.join(',')}]`
    
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
      return NextResponse.json({
        party: party.name,
        short: 'GL-PvdA',
        count: 0,
        website: 'https://groenlinks-pvda.nl',
        standpunten: []
      })
    }

    // Step 4: Use LLM to group quotes into standpunten
    const chunksContext = results.map((r, idx) => 
      `[${idx + 1}] (Pagina ${r.pageNumber}): ${r.content}`
    ).join('\n\n')

    const prompt = `Je bent een expert in het analyseren van politieke verkiezingsprogramma's. 

Hieronder staan tekst fragmenten uit het GroenLinks-PvdA verkiezingsprogramma die relevant zijn voor de zoekopdracht: "${query}"

${chunksContext}

Je taak is om:
1. Deze fragmenten te groeperen in maximaal 5 semantisch verschillende standpunten/posities
2. Voor elk standpunt: 
   - Geef een duidelijke titel (max 10 woorden)
   - Geef een korte beschrijving/ondertitel (max 20 woorden)
   - Selecteer maximaal 5 meest relevante en representatieve quotes (VERBATIM uit de tekst, geen parafrasering!)
   - Elk quote moet duidelijk dit standpunt ondersteunen
   - Vermeld het fragment nummer [X] en paginanummer bij elk quote

3. Negeer fragmenten die niet echt relevant zijn of te vaag/algemeen zijn

Geef je antwoord als een JSON object in dit formaat:
{
  "standpunten": [
    {
      "title": "...",
      "subtitle": "...",
      "quotes": [
        {
          "text": "exacte quote uit de tekst",
          "page": 42,
          "fragmentNumber": 5
        }
      ]
    }
  ]
}

BELANGRIJK: 
- Quotes moeten EXACT overeenkomen met de brontekst (verbatim)
- Filter niet-relevante of te algemene fragmenten eruit
- Groepeer alleen quotes die echt hetzelfde standpunt ondersteunen
- Maximaal 5 standpunten, maximaal 5 quotes per standpunt
- Antwoord ALLEEN met het JSON object, geen extra tekst`

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.3,
    })

    // Parse the LLM response
    let parsedResponse
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        parsedResponse = JSON.parse(text)
      }
    } catch (e) {
      console.error('Failed to parse LLM response:', text)
      throw new Error('Failed to parse LLM response')
    }

    // Calculate total count (number of quotes)
    const totalCount = parsedResponse.standpunten.reduce(
      (sum: number, s: any) => sum + s.quotes.length,
      0
    )

    // Return formatted response
    return NextResponse.json({
      party: party.name,
      short: 'GL-PvdA',
      count: totalCount,
      website: 'https://groenlinks-pvda.nl',
      standpunten: parsedResponse.standpunten
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
