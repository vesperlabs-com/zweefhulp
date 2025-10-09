'use client'

import { getPartyLogo, PARTIES } from '@/lib/party-data'

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
  // Defensive check: ensure parties array exists
  if (!results?.parties || !Array.isArray(results.parties)) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        Geen geldige zoekresultaten ontvangen
      </div>
    )
  }

  const sortedParties = [...results.parties].sort((a, b) => {
    if (sortMode === 'alphabetical') {
      return a.party.localeCompare(b.party)
    }
    return b.count - a.count // relevance by count
  })

  // Get PDF URL for a party with page anchor
  const getPdfUrl = (partyName: string, pageNumber: number) => {
    const partyData = PARTIES[partyName]
    if (!partyData) return '#'
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
            className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
              sortMode === 'relevance'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Relevantie
          </button>
          <button
            onClick={() => onSortModeChange('alphabetical')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
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


