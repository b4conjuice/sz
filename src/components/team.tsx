import { useState } from 'react'

import SearchPlayer from '@/components/search-player'
import type { Team as TeamType } from '@/lib/use-teams'

export function EditTeam({
  team,
  saveTeam,
}: {
  team: TeamType
  saveTeam: (team: TeamType) => void
}) {
  const { name, players } = team
  const [newTeamName, setNewTeamName] = useState(name)
  const [newPlayers, setNewPlayers] = useState(players)
  return (
    <>
      <input
        type='text'
        className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
        placeholder='name'
        value={newTeamName}
        onChange={e => {
          setNewTeamName(e.target.value)
        }}
      />
      {newPlayers.length > 0 ? (
        <ul>
          {newPlayers.map((player, index) => (
            <li key={index}>{player.name}</li>
          ))}
        </ul>
      ) : (
        <p>no players</p>
      )}
      <SearchPlayer
        onSelectPlayer={player => {
          setNewPlayers(prev => {
            return [...prev, player]
          })
        }}
      />
      <div className='flex items-center gap-4'>
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          type='button'
          onClick={() => {
            const newTeam = {
              name: newTeamName,
              players: newPlayers,
            }
            saveTeam(newTeam)
          }}
          // disabled={newTeamName === '' || newTeamName === name} // check if players are the same
        >
          save
        </button>
      </div>
    </>
  )
}

export default function Team({ team }: { team: TeamType }) {
  const { name, players } = team

  return (
    <>
      <p>{name}</p>
    </>
  )
}

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C']

const displayPlayerName = (name: string) => {
  const [first, last, suffix] = name.split(' ')
  return last.toLowerCase()
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
