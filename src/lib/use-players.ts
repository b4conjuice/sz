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

export function usePlayers() {
  const [players, setPlayers] = useLocalStorage<Player[]>(
    'sz-players',
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
