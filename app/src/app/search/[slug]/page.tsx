import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import SearchPageClient from './client'
import SearchPageSSR from './server'
import { getCachedSearchResultsBySlug } from '@/lib/search-cache'
import { deslugify } from '@/lib/slugify'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  
  if (!slug) {
    return {
      title: 'Zoeken',
      description: 'Doorzoek verkiezingsprogramma\'s van de Tweede Kamerverkiezingen 2025'
    }
  }

  // Try to get cached results to find the original query
  const cachedResults = await getCachedSearchResultsBySlug(slug)
  const query = cachedResults?.query || deslugify(slug)

  const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1)
  const title = `${capitalizedQuery} in verkiezingsprogramma's 2025`
  const description = `Wat zeggen politieke partijen over "${query}" in hun verkiezingsprogramma's voor de Tweede Kamerverkiezingen 2025? Vergelijk standpunten en citaten.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://zweefhulp.nl/zoeken/${slug}`,
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
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params

  // If no slug, redirect to homepage
  if (!slug) {
    redirect('/')
  }

  // Check if results are fully cached
  const cachedResults = await getCachedSearchResultsBySlug(slug)

  // If fully cached, render server-side with original query
  if (cachedResults) {
    return <SearchPageSSR results={cachedResults} query={cachedResults.query} />
  }

  // Otherwise, render client-side with loading (will use deslugified query as fallback)
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <SearchPageClient />
    </Suspense>
  )
}
