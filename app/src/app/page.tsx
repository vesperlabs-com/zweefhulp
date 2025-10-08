'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Main Container */}
      <div className="flex-grow flex flex-col items-center justify-center w-full px-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-2">
            Zweef<span className="text-blue-600">hulp</span>
          </h1>
          <p className="text-gray-600 text-sm mt-3">
            Doorzoek alle verkiezingsprogramma&apos;s voor de Tweede Kamerverkiezingen 2025 met AI
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center border border-gray-300 rounded-full px-5 py-3 hover:shadow-md transition-shadow focus-within:shadow-md">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek op thema's, interesses, of onderwerpen..."
                className="flex-grow outline-none text-gray-700"
                autoComplete="off"
              />
            </div>
          </form>
        </div>

        {/* Suggested Search Terms */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {[
              'woningmarkt',
              'hypotheekrenteaftrek',
              'stikstof',
              'bestaanszekerheid',
              'NAVO',
              'normen en waarden',
              'startups',
              'asielzoekers',
              'zorgakkoord',
              'europa',
            ].map((term) => (
              <Link href={`/search?q=${term}`}
                key={term}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200 transition-colors"
              >
                {term}
                </Link>
            ))}
          </div>
        </div>
      </div>

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