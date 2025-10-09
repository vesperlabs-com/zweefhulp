import { useState, useEffect } from 'react'

export function useFavorites(initialFavorites?: string[]) {
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(initialFavorites || [])
  )

  useEffect(() => {
    // Only load from cookie if we don't have initial favorites
    if (!initialFavorites) {
      const saved = document.cookie
        .split('; ')
        .find(row => row.startsWith('zweefhulp_favorites='))
        ?.split('=')[1]
      
      if (saved) {
        try {
          const parsed = JSON.parse(decodeURIComponent(saved))
          setFavorites(new Set(parsed))
        } catch {
          console.warn('Failed to parse favorites cookie')
        }
      }
    }
  }, [initialFavorites])

  const toggleFavorite = (partyName: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(partyName)) {
      newFavorites.delete(partyName)
    } else {
      newFavorites.add(partyName)
    }
    
    setFavorites(newFavorites)
    
    // Save to cookie (expires in 1 year)
    const cookieValue = encodeURIComponent(JSON.stringify([...newFavorites]))
    document.cookie = `zweefhulp_favorites=${cookieValue}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
  }

  const isFavorite = (partyName: string) => favorites.has(partyName)

  return { toggleFavorite, isFavorite }
}
