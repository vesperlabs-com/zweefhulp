import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma-edge'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zweefhulp.nl'
  
  // Get all parties to check for complete caching
  const allParties = await prisma.party.findMany()
  const totalParties = allParties.length
  
  // Get all cached search results grouped by slug
  const cachedSearches = await prisma.searchResult.groupBy({
    by: ['slug'],
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
  
  // Get the most recent update date for each fully cached slug
  const slugsWithDates = await Promise.all(
    cachedSearches.map(async (search) => {
      const mostRecent = await prisma.searchResult.findFirst({
        where: { slug: search.slug },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })
      return {
        slug: search.slug,
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
    ...slugsWithDates.map(({ slug, lastModified }) => ({
      url: `${baseUrl}/zoeken/${slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
  
  return sitemap
}

