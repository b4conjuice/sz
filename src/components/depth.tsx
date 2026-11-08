import type { Team as TeamType } from '@/lib/use-teams'

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

const displayPlayerName = (name: string) => {
  return name.split(' ').at(1)?.toLowerCase() ?? name.toLowerCase()
}

export function Depth({ team }: { team: TeamType }) {
  const getPlayersByPosition = (position: string) => {
    const playersByPosition = team.players
      .filter(player => player.position.some(pos => pos === position))
      .map(player => displayPlayerName(player.name))
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
                  {getPlayersByPosition(position).map(name => (
                    <td
                      key={name}
                      className='max-w-sm truncate px-1 py-1 text-center'
                    >
                      {name}
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
