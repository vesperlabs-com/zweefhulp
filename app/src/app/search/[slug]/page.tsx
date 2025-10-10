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
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { slug } = await params
  const { q } = await searchParams

  // If no slug, redirect to homepage
  if (!slug) {
    redirect('/')
  }

  // Check if results are fully cached
  const cachedResults = await getCachedSearchResultsBySlug(slug)

  // If fully cached, render server-side with original query
  if (cachedResults) {
    // If there's a query parameter, redirect to clean URL (cached results don't need it)
    if (q) {
      redirect(`/zoeken/${slug}`)
    }
    return <SearchPageSSR results={cachedResults} query={cachedResults.query} />
  }

  // If we have a query parameter, we need to pass it to the client
  // but clean up the URL on the client side
  const queryToUse = q || deslugify(slug)
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <SearchPageClient initialQuery={queryToUse} shouldCleanUrl={!!q} />
    </Suspense>
  )
}
