'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

const LOADING_MESSAGES = [
  'Koffie halen voor de Tweede Kamer...',
  'Politieke streepjes aan het tellen...',
  'Coalitieonderhandelingen aan het speedrunnen...',
  'Debatleden aan het briefen...',
  'Compromissen aan het voorkauwen...',
  'De Kieswet aan het nalezen...',
  'Stemhokjes aan het opbouwen...',
  'Fractieleden aan het wakker maken...',
  'Overleggen met het pluche...',
  'Achterkamertjes even raadplegen...',
  'Applaus voor de democratie optrommelen...',
  'Verkiezingsbeloftes aan het inwisselen...',
  'Ministersposten aan het verdelen...',
  'Coalitieakkoorden aan het voorschrijven...',
  'Kamervragen aan het formuleren...',
  'Peilingen aan het negeren...',
]

export default function SearchPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [sortMode, setSortMode] = useState<'relevance' | 'alphabetical'>('relevance')

  // Encode query with + for spaces (like Google)
  const encodeQuery = (q: string) => encodeURIComponent(q).replace(/%20/g, '+')

  useEffect(() => {
    if (query) {
      fetchResults(query)
    }
  }, [query])

  const fetchResults = async (q: string) => {
    setLoading(true)
    setError(null)
    
    // Rotate loading messages every 3 seconds
    const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
    setLoadingMessage(randomMessage)
    
    const interval = setInterval(() => {
      const newMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
      setLoadingMessage(newMessage)
    }, 3000)
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (!response.ok) {
        const errorData = await response.json()
        // Store structured error data
        setError(JSON.stringify(errorData))
        return
      }
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(JSON.stringify({ error: 'Er is iets misgegaan' }))
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

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
        {/* Search Query Display and Sort Toggle */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            <span className="block text-sm font-normal font-sans text-gray-600 mb-1">Verkiezingsprogramma's 2025 over</span>
            {query}
          </h1>
          
          {/* Sort Toggle - only show when results are available */}
          {!loading && !error && results && (
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1 whitespace-nowrap">
              <button
                type="button"
                onClick={() => setSortMode('relevance')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all cursor-pointer ${
                  sortMode === 'relevance'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Relevantie
              </button>
              <button
                type="button"
                onClick={() => setSortMode('alphabetical')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-all cursor-pointer ${
                  sortMode === 'alphabetical'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                A-Z
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{loadingMessage}</p>
            <p className="mt-2 text-sm text-gray-500">Dit kan tot een minuut duren</p>
          </div>
        )}

        {error && (() => {
          let errorData
          try {
            errorData = JSON.parse(error)
          } catch {
            errorData = { error: error }
          }

          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium mb-2">{errorData.error}</p>
              {errorData.description && (
                <p className="text-red-700 text-sm">
                  {errorData.description}
                </p>
              )}
            </div>
          )
        })()}

        {!loading && !error && results && (
          <SearchResultsDisplay
            results={results}
            query={query}
            sortMode={sortMode}
          />
        )}
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

