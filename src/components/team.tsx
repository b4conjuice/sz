import type { Draft, Team as TeamType } from '@/lib/use-teams'

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

function getPick({
  round,
  teams,
  pick,
  thirdRoundReversal = false,
}: {
  round: number
  teams: number
  pick: number
  thirdRoundReversal?: boolean
}) {
  const draftRound = round + 1
  const teamIndex = pick - 1

  const pickInRound =
    thirdRoundReversal && draftRound >= 3
      ? draftRound === 3
        ? teams - 1 - teamIndex
        : draftRound % 2 === 0
          ? teamIndex
          : teams - 1 - teamIndex
      : draftRound % 2 === 1
        ? teamIndex
        : teams - 1 - teamIndex

  return (draftRound - 1) * teams + pickInRound + 1
}

export function Draft({ draft }: { draft: Draft }) {
  const { players, teams, pick } = draft
  return (
    <>
      <ul className='divide-cb-dusty-blue divide-y'>
        {players.map((player, round) => (
          <li key={round} className='flex py-4 first:pt-0 last:pb-0'>
            <span className='flex grow gap-2'>
              <span>
                {getPick({
                  round,
                  teams,
                  pick,
                })}
              </span>
              <span>{player.name}</span>
              <span>{player.position.join(', ')}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}
