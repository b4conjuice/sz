import type { Draft as DraftType } from '@/lib/use-teams'

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

export function Draft({ draft }: { draft: DraftType }) {
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
