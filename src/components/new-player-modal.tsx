import { useState } from 'react'
import classNames from 'classnames'
import { ArrowDownOnSquareIcon } from '@heroicons/react/20/solid'

import Modal from '@/components/modal'
import type { Player } from '@/lib/use-players'

export default function NewPlayerModal({
  isOpen,
  setIsOpen,
  playerList,
  title = 'create new player',
  onSubmit,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  playerList: Player[]
  title?: string
  onSubmit: (player: Player) => void
}) {
  const [newPlayer, setNewPlayer] = useState<Player>({
    name: '',
    team: '',
    position: [],
  })
  const positions = [
    ...new Set([
      'PG',
      'SG',
      'SF',
      'PF',
      'C',
      ...playerList.flatMap(player => player.position),
    ]),
  ]
  const playerTeams = [
    ...new Set(playerList.map(player => player.team)),
  ].filter(playerTeam => Boolean(playerTeam))
  const submitNewPlayer = () => {
    if (newPlayer.name === '' || newPlayer.team === '') {
      return
    }
    onSubmit(newPlayer)
    setNewPlayer({ name: '', team: '', position: [] })
    setIsOpen(false)
  }
  return (
    <Modal title={title} isOpen={isOpen} setIsOpen={setIsOpen}>
      <form
        className='space-y-3'
        onSubmit={e => {
          e.preventDefault()
          submitNewPlayer()
        }}
        onKeyDown={e => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          submitNewPlayer()
        }}
      >
        <input
          type='text'
          className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
          placeholder='name'
          value={newPlayer.name}
          onChange={e => {
            setNewPlayer(prev => ({
              ...prev,
              name: e.target.value,
            }))
          }}
        />
        <input
          type='text'
          className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
          placeholder='team'
          value={newPlayer.team}
          onChange={e => {
            setNewPlayer(prev => ({
              ...prev,
              team: e.target.value,
            }))
          }}
        />
        {playerTeams.length > 0 && (
          <select
            className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
            value={playerTeams.includes(newPlayer.team) ? newPlayer.team : ''}
            onChange={e => {
              setNewPlayer(prev => ({
                ...prev,
                team: e.target.value,
              }))
            }}
          >
            <option value=''>select team</option>
            {playerTeams.map(playerTeam => (
              <option key={playerTeam} value={playerTeam}>
                {playerTeam}
              </option>
            ))}
          </select>
        )}
        <ul className='flex gap-2 overflow-x-auto'>
          {positions.map(pos => (
            <li key={pos}>
              <button
                className={classNames(
                  'bg-cb-blue rounded-lg border p-2',
                  newPlayer.position.includes(pos)
                    ? 'border-cb-pink'
                    : 'border-cb-blue'
                )}
                type='button'
                onClick={() => {
                  const newPositionIndex = newPlayer.position.findIndex(
                    p => p === pos
                  )
                  const newPosition = [...newPlayer.position]
                  if (newPositionIndex > -1) {
                    newPosition.splice(newPositionIndex, 1)
                  } else {
                    newPosition.push(pos)
                  }
                  setNewPlayer(prev => ({
                    ...prev,
                    position: newPosition,
                  }))
                }}
              >
                {pos}
              </button>
            </li>
          ))}
        </ul>
        <div className='flex items-center gap-4'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2 disabled:pointer-events-none disabled:opacity-25'
            type='submit'
            disabled={newPlayer.name === '' || newPlayer.team === ''}
          >
            <ArrowDownOnSquareIcon className='h-6 w-6' /> save
          </button>
        </div>
      </form>
    </Modal>
  )
}
