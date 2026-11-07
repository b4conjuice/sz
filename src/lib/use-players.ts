import { useLocalStorage } from '@uidotdev/usehooks'

const defaultPlayers = [
  {
    name: 'Victor Wembanyama',
    team: 'SA',
    position: ['C'],
  },
]

export type Player = {
  name: string
  team: string
  position: string[]
}

const PLAYERS_STORAGE_KEY = 'sz-players'

export function getPlayers(): Player[] {
  if (typeof window === 'undefined') {
    return defaultPlayers
  }
  const stored = window.localStorage.getItem(PLAYERS_STORAGE_KEY)
  if (!stored) {
    return defaultPlayers
  }
  try {
    return JSON.parse(stored) as Player[]
  } catch {
    return defaultPlayers
  }
}

export function usePlayers() {
  const [players, setPlayers] = useLocalStorage<Player[]>(
    PLAYERS_STORAGE_KEY,
    defaultPlayers
  )
  const overwritePlayers = (newPlayers: Player[]) => {
    setPlayers(newPlayers)
  }
  const savePlayer = ({
    player,
    index,
  }: {
    player: Player
    index?: number
  }) => {
    setPlayers(prev => {
      if (index === -1 || index === undefined) {
        return [...prev, player]
      } else {
        const newPlayers = [...prev]
        newPlayers[index] = player
        return newPlayers
      }
    })
  }
  return {
    players,
    savePlayer,
    overwritePlayers,
  }
}
