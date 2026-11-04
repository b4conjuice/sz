import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import classNames from 'classnames'

import Menu from '@/components/menu'
import { usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'
import { useTeams } from '@/lib/use-teams'

export const Route = createFileRoute('/players/$playerIndex')({
  component: RouteComponent,
})

function listsAreEqual(list1: string[], list2: string[]): boolean {
  if (list1.length !== list2.length) return false

  const counts = new Map<string, number>()

  for (const item of list1) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }

  for (const item of list2) {
    const count = counts.get(item)
    if (count === undefined) return false
    if (count === 1) counts.delete(item)
    else counts.set(item, count - 1)
  }

  return counts.size === 0
}

function RouteComponent() {
  const navigate = useNavigate()
  const { playerIndex: playerIndexParam } = Route.useParams()
  const playerIndex = Number(playerIndexParam)
  const { players, savePlayer } = usePlayers()
  const { teams } = useTeams()
  const player = players[playerIndex]
  const [newPlayer, setNewPlayer] = useState<Player>(player)
  const rank = playerIndex + 1
  const positions = [
    ...new Set([
      ...players.reduce((currentAllTags: string[], currentPlayer: Player) => {
        const { position } = currentPlayer
        const playerTags = [...position]
        return [...currentAllTags, ...playerTags]
      }, []),
    ]),
  ]
  const { name, position, team } = player
  const teamsWithPlayer = teams.filter(t =>
    t.players.some(p => p.name === name)
  )
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2 className='flex items-baseline gap-2'>
          <span>{rank}</span>
          <span>{name}</span>
          <span>{position.join(', ')}</span>
          <span className='text-sm'>{team}</span>
        </h2>
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
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              savePlayer({
                player: newPlayer,
                index: playerIndex,
              })
            }}
            disabled={
              newPlayer.name === player.name &&
              newPlayer.team === player.team &&
              listsAreEqual(newPlayer.position, player.position)
            }
          >
            save
          </button>
        </div>
        <h2>on teams</h2>
        {teamsWithPlayer.length > 0 ? (
          <ul className='divide-cb-dusty-blue divide-y'>
            {teamsWithPlayer.map((t, index) => (
              <li key={index} className='flex gap-2 py-4 first:pt-0'>
                <Link
                  to='/teams/$teamIndex'
                  params={{
                    teamIndex: String(teams.indexOf(t)),
                  }}
                  className='text-cb-pink hover:text-cb-pink/75 flex grow items-baseline gap-2'
                >
                  <span>{t.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>you have no teams with this player</p>
        )}
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu
            navigationCommands={teamsWithPlayer.map(t => ({
              id: `go-${t.name}`,
              title: `go ${t.name}`,
              action: () => {
                navigate({
                  to: '/teams/$teamIndex',
                  params: {
                    teamIndex: String(teams.indexOf(t)),
                  },
                })
              },
            }))}
          />
        </div>
        <div className='flex space-x-6'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              // setIsAddPlayerModalOpen(true)
            }}
          >
            {/* <PlusIcon className='h-6 w-6' /> */}
          </button>
        </div>
      </footer>
    </>
  )
}
