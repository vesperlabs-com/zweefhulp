import { prisma } from './prisma-edge'
import { slugify } from './slugify'

type Quote = {
  text: string
  page: number
}

type Position = {
  title: string
  subtitle: string
  quotes: Quote[]
}

type PartyResult = {
  party: string
  short: string
  count: number
  website: string
  summary: string
  positions: Position[]
}

type SearchResults = {
  parties: PartyResult[]
  query: string
}

/**
 * Check if all parties have cached results for a given query
 * and return those results if they exist
 */
export async function getCachedSearchResults(
  query: string
): Promise<SearchResults | null> {
  // Fetch all parties
  const allParties = await prisma.party.findMany({
    orderBy: { name: 'asc' }
  })

  if (allParties.length === 0) {
    return null
  }

  // Fetch all cached results for this query
  const cachedResults = await prisma.searchResult.findMany({
    where: { query },
    include: {
      party: true,
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

  // Check if we have results for all parties
  if (cachedResults.length !== allParties.length) {
    return null // Not all parties cached yet
  }

  // Transform cached results to the expected format
  const parties: PartyResult[] = allParties.map(party => {
    const cached = cachedResults.find(r => r.partyId === party.id)
    
    if (!cached) {
      // This shouldn't happen due to the length check above, but handle it safely
      return {
        party: party.name,
        short: party.shortName || party.name,
        count: 0,
        website: party.website || '#',
        summary: '',
        positions: []
      }
    }

    const positions = cached.positions.map(pos => ({
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
      summary: cached.summary,
      positions
    }
  })

  return { parties, query }
}

/**
 * Get cached search results by slug
 * Returns the original query and results if fully cached
 */
export async function getCachedSearchResultsBySlug(
  slug: string
): Promise<SearchResults | null> {
  // First, find any search result with this slug to get the original query
  const firstResult = await prisma.searchResult.findFirst({
    where: { slug },
    select: { query: true }
  })

  if (!firstResult) {
    return null
  }

  // Now get all results using the original query
  return getCachedSearchResults(firstResult.query)
}

