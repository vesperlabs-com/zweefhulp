import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma-edge'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zweefhulp.nl'
  
  // Get all parties to check for complete caching
  const allParties = await prisma.party.findMany()
  const totalParties = allParties.length
  
  // Get all cached search results grouped by query
  const cachedSearches = await prisma.searchResult.groupBy({
    by: ['query'],
    _count: {
      partyId: true,
    },
    having: {
      partyId: {
        _count: {
          equals: totalParties,
        },
      },
    },
  })
  
  // Get the most recent update date for each fully cached query
  const queriesWithDates = await Promise.all(
    cachedSearches.map(async (search) => {
      const mostRecent = await prisma.searchResult.findFirst({
        where: { query: search.query },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })
      return {
        query: search.query,
        lastModified: mostRecent?.createdAt || new Date(),
      }
    })
  )
  
  // Create sitemap entries
  const sitemap: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Search results pages
    ...queriesWithDates.map(({ query, lastModified }) => ({
      url: `${baseUrl}/search?q=${encodeURIComponent(query).replace(/%20/g, '+')}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
  
  return sitemap
}

