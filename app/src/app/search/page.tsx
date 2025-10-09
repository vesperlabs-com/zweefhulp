import { Suspense } from 'react'
import type { Metadata } from 'next'
import SearchPageClient from './client'
import SearchPageSSR from './server'
import { getCachedSearchResults } from '@/lib/search-cache'

export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}): Promise<Metadata> {
  const params = await searchParams
  const query = params.q || ''
  
  if (!query) {
    return {
      title: 'Zoeken',
      description: 'Doorzoek verkiezingsprogramma\'s van de Tweede Kamerverkiezingen 2025'
    }
  }

  const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1)
  const title = `${capitalizedQuery} in verkiezingsprogramma's 2025`
  const description = `Wat zeggen politieke partijen over "${query}" in hun verkiezingsprogramma's voor de Tweede Kamerverkiezingen 2025? Vergelijk standpunten en citaten.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://zweefhulp.nl/search?q=${encodeURIComponent(query).replace(/%20/g, '+')}`,
      images: ["/banner.png"]
    },
    twitter: {
      card: 'summary',
      title,
      description,
    }
  }
}

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const params = await searchParams
  const query = params.q || ''

  // If no query, render client component
  if (!query) {
    return (
      <Suspense fallback={<div>Laden...</div>}>
        <SearchPageClient />
      </Suspense>
    )
  }

  // Check if results are fully cached
  const cachedResults = await getCachedSearchResults(query)

  // If fully cached, render server-side
  if (cachedResults) {
    return <SearchPageSSR results={cachedResults} query={query} />
  }

  // Otherwise, render client-side with loading
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <SearchPageClient />
    </Suspense>
  )
}
