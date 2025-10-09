import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load from cookie on mount
    const saved = document.cookie
      .split('; ')
      .find(row => row.startsWith('zweefhulp_favorites='))
      ?.split('=')[1]
    
    if (saved) {
      try {
        const parsed = JSON.parse(decodeURIComponent(saved))
        setFavorites(new Set(parsed))
      } catch (e) {
        console.warn('Failed to parse favorites cookie')
      }
    }
  }, [])

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
