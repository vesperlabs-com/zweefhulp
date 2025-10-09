import { Suspense } from 'react'
import type { Metadata } from 'next'
import SearchPageClient from './client'

export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Promise<Metadata> {
  const query = searchParams.q || ''
  
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  }
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <SearchPageClient />
    </Suspense>
  )
}
