import { Link } from '@tanstack/react-router'

import { usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

const displayPlayerName = (player: Player) => {
  return (
    player.nickname ??
    player.name.split(' ').at(1)?.toLowerCase() ??
    player.name.toLowerCase()
  )
}

export function Depth({ players }: { players: Player[] }) {
  const { players: allPlayers } = usePlayers()
  const getPlayersByPosition = (position: string) => {
    const playersByPosition = players
      .map(player => {
        const index = allPlayers.findIndex(p => p.name === player.name)
        return {
          player: index > -1 ? allPlayers[index] : player,
          index,
        }
      })
      .filter(({ player }) => player.position.some(pos => pos === position))
    return playersByPosition
  }
  return (
    <div className='flex w-full'>
      <div className='w-12'>
        <table className='border-cb-dusty-blue w-full table-fixed border-r-4'>
          <tbody>
            {POSITIONS.map(position =>
              getPlayersByPosition(position).length > 0 ? (
                <tr key={position} className='odd:bg-cb-blue'>
                  <td className='py-1 text-center'>{position}</td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>
      <div className='flex grow overflow-x-auto'>
        <table className='w-full'>
          <tbody>
            {POSITIONS.map(position =>
              getPlayersByPosition(position).length > 0 ? (
                <tr key={position} className='odd:bg-cb-blue px-1'>
                  {getPlayersByPosition(position).map(({ player, index }) => (
                    <td
                      key={`${player.name}-${index}`}
                      className='max-w-sm truncate px-1 py-1 text-center'
                    >
                      {index > -1 ? (
                        <Link
                          to='/players/$playerIndex'
                          params={{ playerIndex: String(index) }}
                          className='text-cb-pink hover:text-cb-pink/75'
                        >
                          {displayPlayerName(player)}
                        </Link>
                      ) : (
                        displayPlayerName(player)
                      )}
                    </td>
                  ))}
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
