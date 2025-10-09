'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getPartyLogo } from '@/lib/party-data'

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
  'Verkiezingsbeloftes aan het feit-checken...',
  'Standpunten aan het vergelijken...',
  'Debatleden aan het briefen over jouw vraag...',
  'Compromissen aan het pre-kauwen voor je...',
  'De Kieswet aan het nalezen...',
  'Programmapunten zoeken met een vergrootglas...',
  'Stemhokjes aan het opbouwen...',
  'Fractieleden aan het wakker maken...',
  'Overleggen met het pluche...',
  'Achterkamertjes even raadplegen...',
  'Applaus voor de democratie optrommelen...',
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
        throw new Error('Fout bij het zoeken')
      }
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan')
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
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek in verkiezingsprogramma's..."
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
          <div className="flex items-end justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="block text-sm font-normal font-sans text-gray-600 mb-1">Verkiezingsprogramma's 2025 over</span>
              {query}
            </h1>
            
            {/* Sort Toggle */}
            {!loading && !error && results && (
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1 whitespace-nowrap">
                <button
                  onClick={() => setSortMode('relevance')}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                    sortMode === 'relevance'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Relevantie
                </button>
                <button
                  onClick={() => setSortMode('alphabetical')}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
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
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{loadingMessage}</p>
            <p className="mt-2 text-sm text-gray-500">Dit kan tot een minuut duren</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && results && (
          <>
            {/* Party Navigator */}
            <div className="sticky top-[70px] z-10 -mx-4 px-4 py-3 bg-gray-50/95 backdrop-blur-sm border-y border-gray-200 mb-6">
              <div className="flex justify-evenly overflow-x-auto scrollbar-hide py-2 gap-x-1">
                {results.parties
                  .sort((a, b) => {
                    if (sortMode === 'alphabetical') {
                      return a.party.localeCompare(b.party)
                    }
                    return b.count - a.count // relevance by count
                  })
                  .map((partyResult) => {
                    const partyId = partyResult.short.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
                    const hasResults = partyResult.positions.length > 0
                    
                    return (
                      <a
                        key={partyResult.party}
                        href={`#${partyId}`}
                        className="flex-shrink-0 transition-all hover:scale-110"
                        title={partyResult.party}
                      >
                        <img 
                          src={getPartyLogo(partyResult.party)} 
                          alt={partyResult.party}
                          className={`h-10 w-10 rounded-full object-cover ${!hasResults ? 'opacity-30 grayscale' : ''}`}
                        />
                      </a>
                    )
                  })}
              </div>
            </div>

            {/* Party Results */}
            <div className="space-y-6">
              {results.parties
                .sort((a, b) => {
                  if (sortMode === 'alphabetical') {
                    return a.party.localeCompare(b.party)
                  }
                  return b.count - a.count // relevance by count
                })
                .map((partyResult) => {
                  const partyId = partyResult.short.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
                  const hasResults = partyResult.positions.length > 0
                  
                  return (
                    <div 
                      key={partyResult.party} 
                      id={partyId}
                      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 scroll-mt-[160px] ${!hasResults ? 'opacity-60' : ''}`}
                    >
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <img 
                              src={getPartyLogo(partyResult.party)} 
                              alt={partyResult.party}
                              className={`h-10 w-auto ${!hasResults ? 'grayscale opacity-50' : ''}`}
                            />
                            <h3 className="text-xl font-medium text-gray-800">{partyResult.party}</h3>
                          </div>
                          <a
                            href={partyResult.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                          >
                            Lees meer
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                        {partyResult.summary && (
                          <p className="text-sm text-gray-600">
                            {partyResult.summary}
                          </p>
                        )}
                        {!hasResults && (
                          <p className="text-sm text-gray-600 italic">
                            Niet expliciet genoemd in verkiezingsprogramma
                          </p>
                        )}
                      </div>
                      
                      {hasResults && (
                        <div className="space-y-5">
                          {partyResult.positions.map((position, idx) => (
                            <div key={idx} className="border-l-2 border-blue-500 pl-4">
                              <h4 className="font-medium text-gray-800 mb-1">{position.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{position.subtitle}</p>
                              <div className="space-y-2">
                                {position.quotes.map((quote, qIdx) => (
                                  <div key={qIdx} className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded">
                                    <p>&ldquo;{quote.text}&rdquo;</p>
                                    <p className="text-xs text-gray-500 mt-1">Pagina {quote.page}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>
            Een initiatief van{' '}
            <a href="https://gaal.co" className="text-blue-600 hover:text-blue-700" target="_blank" rel="noopener noreferrer">
              Robert Gaal
            </a>
            {' '}en{' '}
            <a href="https://stefanborsje.com/" className="text-blue-600 hover:text-blue-700" target="_blank" rel="noopener noreferrer">
              Stefan Borsje
            </a>
          </p>
          <div className="flex gap-3">
            <a href="https://github.com/vesperlabs-com/zweefhulp" className="text-blue-600 hover:text-blue-700" target="_blank" rel="noopener noreferrer">
              Broncode
            </a>
            <span>•</span>
            <a href="mailto:info@zweefhulp.nl" className="text-blue-600 hover:text-blue-700">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

