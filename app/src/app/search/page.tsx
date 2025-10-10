import { redirect } from 'next/navigation'
import { slugify } from '@/lib/slugify'

/**
 * Redirect handler for old search URLs
 * Redirects /search?q=foo to /zoeken/foo
 */
export default async function SearchRedirect({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = params.q

  // If no query, redirect to homepage
  if (!query || query.trim() === '') {
    redirect('/')
  }

  // Redirect to the new slug-based URL
  const slug = slugify(query.trim())
  redirect(`/zoeken/${slug}`)
}

