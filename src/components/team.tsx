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
