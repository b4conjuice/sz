import { useLocalStorage } from '@uidotdev/usehooks'

import type { Player } from '@/lib/use-players'

const WATCHLIST_STORAGE_KEY = 'sz-watchlist'

const defaultWatchlist: Player[] = []

export function getWatchlist(): Player[] {
  if (typeof window === 'undefined') {
    return defaultWatchlist
  }
  const stored = window.localStorage.getItem(WATCHLIST_STORAGE_KEY)
  if (!stored) {
    return defaultWatchlist
  }
  try {
    return JSON.parse(stored) as Player[]
  } catch {
    return defaultWatchlist
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useLocalStorage<Player[]>(
    WATCHLIST_STORAGE_KEY,
    defaultWatchlist
  )
  const overwriteWatchlist = (newWatchlist: Player[]) => {
    setWatchlist(newWatchlist)
  }
  const addPlayerToWatchlist = (player: Player) => {
    setWatchlist(prev =>
      prev.some(currentPlayer => currentPlayer.name === player.name)
        ? prev
        : [...prev, player]
    )
  }
  const removePlayerFromWatchlist = (playerName: string) => {
    setWatchlist(prev =>
      prev.filter(currentPlayer => currentPlayer.name !== playerName)
    )
  }
  return {
    watchlist,
    overwriteWatchlist,
    addPlayerToWatchlist,
    removePlayerFromWatchlist,
  }
}
