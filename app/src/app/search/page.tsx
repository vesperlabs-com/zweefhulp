'use client'

import { useState, useEffect, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Quote = {
  text: string
  page: number
}

type Standpunt = {
  title: string
  subtitle: string
  quotes: Quote[]
}

type PartyResult = {
  party: string
  short: string
  count: number
  website: string
  standpunten: Standpunt[]
}

type SearchResults = {
  parties: PartyResult[]
}

const LOADING_MESSAGES = [
  'Even koffie halen voor de Tweede Kamer...',
  'Politieke streepjes aan het tellen (zonder regeerakkoord)...',
  'Coalitieonderhandelingen aan het speedrunnen...',
  'Verkiezingsbeloftes aan het feit-checken... dit kan even duren...',
  'Standpunten aan het vergelijken (zonder ruzie te maken)...',
  'Debatleden aan het briefen over jouw vraag...',
  'Compromissen aan het pre-kauwen voor je...',
  'Even de Kieswet nalezen... grapje, dit gaat sneller...',
  'Programmapunten zoeken met een vergrootglas... 🔍',
  'Stemhokjes aan het opbouwen (digitaal dan)...',
  'Fractieleden aan het wakker maken...',
  'Even overleggen met het pluche...',
  'Kamerzetels aan het tellen alsof het Black Friday is...',
  'Wacht, eerst even applaus voor de democratie... 👏',
]

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])

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
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Search */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors whitespace-nowrap">
              Zweef<span className="text-blue-600">hulp</span>
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
          <p className="text-sm text-gray-600 mb-1">Zoekresultaten voor</p>
          <h1 className="text-3xl font-normal text-gray-800">{query}</h1>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{loadingMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && results && (
          <>
            {/* Frequency Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-800 mb-6">Frequentie van vermeldingen</h2>
              
              <div className="flex items-end justify-start gap-3 overflow-x-auto pb-2 pt-2" style={{ height: '360px' }}>
                {(() => {
                  const sortedParties = [...results.parties].sort((a, b) => b.count - a.count)
                  const maxCount = Math.max(...results.parties.map(p => p.count), 1)
                  const hasResults = sortedParties.some(p => p.count > 0)
                  
                  if (!hasResults) {
                    return <p className="text-gray-500 text-sm">Geen vermeldingen gevonden</p>
                  }
                  
                  return sortedParties.map((party) => {
                    if (party.count === 0) return null
                    
                    const barHeight = (party.count / maxCount) * 300
                    const barColor = party.count > 10 ? 'bg-blue-600' : party.count > 5 ? 'bg-blue-500' : 'bg-blue-400'
                    const partyId = party.short.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
                    
                    return (
                      <a 
                        key={party.short}
                        href={`#${partyId}`}
                        className="flex flex-col items-center group flex-shrink-0" 
                        style={{ width: '60px', height: '100%' }}
                      >
                        <div className="flex-grow flex flex-col justify-end w-full">
                          <div 
                            className={`${barColor} w-full rounded-t transition-all duration-500 flex flex-col items-center justify-start pt-2`}
                            style={{ height: `${barHeight}px` }}
                          >
                            <span className="text-xs font-medium text-white">{party.count}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-700 group-hover:text-blue-600 transition-colors mt-2 text-center break-words w-full">
                          {party.short}
                        </span>
                      </a>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Party Results */}
            <div className="space-y-6">
              {results.parties
                .sort((a, b) => b.count - a.count)
                .map((partyResult) => {
                  const partyId = partyResult.short.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
                  
                  return (
                    <div 
                      key={partyResult.party} 
                      id={partyId}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 scroll-mt-24"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-medium text-gray-800">{partyResult.party}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {partyResult.count} vermelding{partyResult.count !== 1 ? 'en' : ''} gevonden
                          </p>
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
                      
                      {partyResult.count > 0 ? (
                        <div className="space-y-5">
                          {partyResult.standpunten.map((standpunt, idx) => (
                            <div key={idx} className="border-l-2 border-blue-500 pl-4">
                              <h4 className="font-medium text-gray-800 mb-1">{standpunt.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{standpunt.subtitle}</p>
                              <div className="space-y-2">
                                {standpunt.quotes.map((quote, qIdx) => (
                                  <div key={qIdx} className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded">
                                    <p>&ldquo;{quote.text}&rdquo;</p>
                                    <p className="text-xs text-gray-500 mt-1">Pagina {quote.page}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">Geen relevante vermeldingen gevonden in dit programma.</p>
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
            <a href="mailto:robert@gaal.co" className="text-blue-600 hover:text-blue-700">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <SearchContent />
    </Suspense>
  )
}
