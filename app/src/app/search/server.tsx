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

export default function SearchPageSSR({ results, query }: SearchPageSSRProps) {

  return <SearchPageWrapper results={results} query={query} />
}

