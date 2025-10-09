'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SearchResultsDisplay from '@/components/search-results-display'

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
}

type SearchPageWrapperProps = {
  results: SearchResults
  query: string
}

export default function SearchPageWrapper({ results, query }: SearchPageWrapperProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(query)
  const [sortMode, setSortMode] = useState<'relevance' | 'alphabetical'>('relevance')

  // Encode query with + for spaces (like Google)
  const encodeQuery = (q: string) => encodeURIComponent(q).replace(/%20/g, '+')

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeQuery(searchQuery.trim())}`)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Search */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="whitespace-nowrap flex items-center gap-2">
              <img src="/icon.svg" alt="Zweefhulp" width={16} height={16} />
              <h2 className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
                Zweef<span className="text-blue-600">hulp</span>
              </h2>
            </Link>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-grow max-w-full">
              <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 hover:shadow-sm transition-shadow focus-within:shadow-sm bg-white">
                <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  autoCapitalize='none'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek op thema's, interesses, of onderwerpen..."
                  className="flex-grow outline-none text-gray-700 text-sm"
                  autoComplete="off"
                />
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Query Display */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            <span className="block text-sm font-normal font-sans text-gray-600 mb-1">Verkiezingsprogramma's 2025 over</span>
            {query}
          </h1>
        </div>

        <SearchResultsDisplay
          results={results}
          query={query}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
        />
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>
              Een initiatief van{" "}
              <a
                href="https://vesperlabs.com"
                className="text-blue-600 hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vesper Labs
              </a>
            </p>
            <div className="flex gap-3">
              <span>Let op: Verifieer altijd AI-resultaten</span>
              <span>•</span>
              <a
                href="https://github.com/vesperlabs-com/zweefhulp"
                className="text-blue-600 hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Broncode
              </a>
              <span>•</span>
              <a
                href="mailto:info@zweefhulp.nl"
                className="text-blue-600 hover:text-blue-700"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


