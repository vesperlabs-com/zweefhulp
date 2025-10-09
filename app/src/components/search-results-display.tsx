'use client'

import { getPartyLogo, PARTIES } from '@/lib/party-data'
import { useFavorites } from '@/hooks/use-favorites'

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

type SearchResultsDisplayProps = {
  results: SearchResults
  query: string
  sortMode: 'relevance' | 'alphabetical'
  onSortModeChange: (mode: 'relevance' | 'alphabetical') => void
}

export default function SearchResultsDisplay({
  results,
  query,
  sortMode,
  onSortModeChange
}: SearchResultsDisplayProps) {
  const { toggleFavorite, isFavorite } = useFavorites()
  
  // Defensive check: ensure parties array exists
  if (!results?.parties || !Array.isArray(results.parties)) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        Geen geldige zoekresultaten ontvangen
      </div>
    )
  }

  const sortedParties = [...results.parties].sort((a, b) => {
    // Favorites first
    const aIsFav = isFavorite(a.party)
    const bIsFav = isFavorite(b.party)
    
    if (aIsFav && !bIsFav) return -1
    if (!aIsFav && bIsFav) return 1
    
    // Then current sort mode
    if (sortMode === 'alphabetical') {
      return a.party.localeCompare(b.party)
    }
    return b.count - a.count
  })

  // Get PDF URL for a party with page anchor
  const getPdfUrl = (partyName: string, pageNumber: number) => {
    const partyData = PARTIES[partyName]
    if (!partyData) return '#'
    
    // Use environment variable for blob storage base URL
    const blobBaseUrl = process.env.NEXT_PUBLIC_BLOB_BASE_URL
    
    if (blobBaseUrl) {
      return `${blobBaseUrl}/${partyData.program.fileName}#page=${pageNumber}`
    }
    
    // Fallback to local files
    return `/programs/${partyData.program.fileName}#page=${pageNumber}`
  }

  return (
    <>
      {/* Party Navigator */}
      <div className="sticky top-[70px] z-10 -mx-4 px-4 py-3 bg-gray-50/95 backdrop-blur-sm border-y border-gray-200 mb-6">
        <div className="flex justify-evenly overflow-x-auto scrollbar-hide py-2 gap-x-1">
          {sortedParties.map((partyResult) => {
            const partyId = partyResult.short.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
            const hasResults = partyResult.positions?.length > 0
            
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

      {/* Sort Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1 whitespace-nowrap">
          <button
            onClick={() => onSortModeChange('relevance')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-all cursor-pointer ${
              sortMode === 'relevance'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Relevantie
          </button>
          <button
            onClick={() => onSortModeChange('alphabetical')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-all cursor-pointer ${
              sortMode === 'alphabetical'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Party Results */}
      <div className="space-y-6">
        {sortedParties.map((partyResult) => {
          const partyId = partyResult.short.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
          const hasResults = partyResult.positions?.length > 0
          
          return (
            <div 
              key={partyResult.party} 
              id={partyId}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 scroll-mt-[160px] ${!hasResults ? 'opacity-60' : ''}`}
            >
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <a
                      href={partyResult.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-800 hover:text-gray-600 transition-colors"
                    >
                      <img 
                        src={getPartyLogo(partyResult.party)} 
                        alt={partyResult.party}
                        className={`h-10 w-auto ${!hasResults ? 'grayscale opacity-50' : ''}`}
                      />
                      <h2 className="text-xl font-medium">{partyResult.party}</h2>
                    </a>
                    <button 
                      onClick={() => toggleFavorite(partyResult.party)}
                      className={`transition-colors p-1 cursor-pointer ${
                        isFavorite(partyResult.party) 
                          ? 'text-yellow-500 hover:text-yellow-600' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      title={isFavorite(partyResult.party) ? "Uit favorieten" : "Aan favorieten toevoegen"}
                    >
                      <svg className="w-5 h-5" fill={isFavorite(partyResult.party) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                </div>
                {hasResults && partyResult.summary && (
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
              
              {hasResults && partyResult.positions && (
                <div className="space-y-5">
                  {partyResult.positions.map((position, idx) => (
                    <div key={idx} className="border-l-2 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-800 mb-1">{position.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{position.subtitle}</p>
                      <div className="space-y-2">
                        {position.quotes?.map((quote, qIdx) => (
                          <div key={qIdx} className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded">
                            <p>&ldquo;{quote.text}&rdquo;</p>
                            <p className="text-xs text-gray-500 mt-1">
                              <a 
                                href={getPdfUrl(partyResult.party, quote.page)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                Pagina {quote.page}
                              </a>
                            </p>
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
  )
}


