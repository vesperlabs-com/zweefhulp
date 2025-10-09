'use client'

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
  const sortedParties = [...results.parties].sort((a, b) => {
    if (sortMode === 'alphabetical') {
      return a.party.localeCompare(b.party)
    }
    return b.count - a.count // relevance by count
  })

  return (
    <>
      {/* Party Navigator */}
      <div className="sticky top-[70px] z-10 -mx-4 px-4 py-3 bg-gray-50/95 backdrop-blur-sm border-y border-gray-200 mb-6">
        <div className="flex justify-evenly overflow-x-auto scrollbar-hide py-2 gap-x-1">
          {sortedParties.map((partyResult) => {
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
  )
}


