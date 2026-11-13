import { useLocalStorage } from '@uidotdev/usehooks'

const FAVORITE_TEAMS_STORAGE_KEY = 'sz-favorite-teams'

const defaultFavoriteTeams: string[] = []

export function getFavoriteTeams(): string[] {
  if (typeof window === 'undefined') {
    return defaultFavoriteTeams
  }
  const stored = window.localStorage.getItem(FAVORITE_TEAMS_STORAGE_KEY)
  if (!stored) {
    return defaultFavoriteTeams
  }
  try {
    return JSON.parse(stored) as string[]
  } catch {
    return defaultFavoriteTeams
  }
}

export function useFavoriteTeams() {
  const [favoriteTeams, setFavoriteTeams] = useLocalStorage<string[]>(
    FAVORITE_TEAMS_STORAGE_KEY,
    defaultFavoriteTeams
  )
  const isFavoriteTeam = (teamName: string) => favoriteTeams.includes(teamName)
  const toggleFavoriteTeam = (teamName: string) => {
    setFavoriteTeams(prev =>
      prev.includes(teamName)
        ? prev.filter(currentTeamName => currentTeamName !== teamName)
        : [...prev, teamName]
    )
  }
  return {
    favoriteTeams,
    isFavoriteTeam,
    toggleFavoriteTeam,
  }
}