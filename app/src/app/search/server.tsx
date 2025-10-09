import { cookies } from 'next/headers'
import SearchPageWrapper from './wrapper'

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

type SearchPageSSRProps = {
  results: SearchResults
  query: string
}

export default async function SearchPageSSR({ results, query }: SearchPageSSRProps) {
  // Read favorites from cookie on the server
  const cookieStore = await cookies()
  const favoritesCookie = cookieStore.get('zweefhulp_favorites')
  
  let initialFavorites: string[] = []
  if (favoritesCookie?.value) {
    try {
      initialFavorites = JSON.parse(decodeURIComponent(favoritesCookie.value))
    } catch {
      // If parsing fails, just use empty array
    }
  }

  return <SearchPageWrapper results={results} query={query} initialFavorites={initialFavorites} />
}

