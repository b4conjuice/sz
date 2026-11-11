import { useHotkey } from '@tanstack/react-hotkeys'
import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import classNames from 'classnames'
import {
  ArrowDownOnSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'

import Menu from '@/components/menu'
import { getPlayers, usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'
import { DEFAULT_SLOTS, useTeams } from '@/lib/use-teams'
import ImportExportModal from '@/components/import-export-modal'
import Modal from '@/components/modal'
import ConfirmModal from '@/components/confirm-modal'
import { DEFAULT_TITLE } from '@/routes/__root'

export const Route = createFileRoute('/players/$playerIndex')({
  component: RouteComponent,
  ssr: false,
  loader: ({ params }) => {
    const player = getPlayers()[Number(params.playerIndex)]
    return { player }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.player
          ? `${loaderData.player.name} - ${DEFAULT_TITLE}`
          : `players - ${DEFAULT_TITLE}`,
      },
    ],
  }),
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
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  useHotkey('A', () => {
    setIsAddTeamModalOpen(true)
  })
  const navigate = useNavigate()
  const { playerIndex: playerIndexParam } = Route.useParams()
  const playerIndex = Number(playerIndexParam)
  const { players, savePlayer, deletePlayerByIndex } = usePlayers()
  const { teams, saveTeam, addPlayerToTeam } = useTeams()
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
  const teamsWithoutPlayer = teams.filter(t =>
    t.players.every(p => p.name !== name)
  )
  const hasChanges =
    newPlayer.name !== player.name ||
    (newPlayer.nickname ?? '') !== (player.nickname ?? '') ||
    newPlayer.team !== player.team ||
    !listsAreEqual(newPlayer.position, player.position)
  const submitPlayer = () => {
    if (!hasChanges) return
    savePlayer({ player: newPlayer, index: playerIndex })
  }
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2 className='flex items-baseline gap-2'>
          <span>{rank}</span>
          <span>{name}</span>
          <span>{position.join(', ')}</span>
          <span className='text-sm'>{team}</span>
        </h2>
        <form
          className='flex flex-col gap-4'
          onSubmit={e => {
            e.preventDefault()
            submitPlayer()
          }}
          onKeyDown={e => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            submitPlayer()
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
            placeholder='nickname'
            value={newPlayer.nickname ?? ''}
            onChange={e => {
              setNewPlayer(prev => ({
                ...prev,
                nickname: e.target.value,
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
              disabled={!hasChanges}
            >
              <ArrowDownOnSquareIcon className='h-6 w-6' /> save
            </button>
            <button
              className='text-red-700 hover:text-red-700/75 flex items-center gap-2'
              type='button'
              onClick={() => {
                setIsConfirmModalOpen(true)
              }}
            >
              <TrashIcon className='h-6 w-6' /> delete
            </button>
          </div>
        </form>
        <div className='flex gap-4'>
          <h2>on teams</h2>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              setIsAddTeamModalOpen(true)
            }}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
        </div>
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
          <ImportExportModal
            object={player}
            setObject={(p: Player) => {
              setNewPlayer(p)
              savePlayer({
                index: playerIndex,
                player: p,
              })
            }}
          />
        </div>
      </footer>
      <Modal
        title={`add ${name} to team`}
        isOpen={isAddTeamModalOpen}
        setIsOpen={setIsAddTeamModalOpen}
      >
        {teamsWithoutPlayer.length > 0 && (
          <ul className='divide-cb-white/25 divide-y'>
            {teamsWithoutPlayer.map((t, index) => (
              <li key={index} className='flex gap-2 py-4 first:pt-0'>
                <button
                  onClick={() => {
                    addPlayerToTeam({
                      teamIndex: teams.indexOf(t),
                      player,
                    })
                    setIsAddTeamModalOpen(false)
                  }}
                  className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2'
                >
                  <PlusIcon className='h-6 w-6' /> {t.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <hr className='border-cb-white/25' />
        <form
          className='space-y-3'
          onSubmit={e => {
            e.preventDefault()
            saveTeam({
              team: {
                name: newTeamName,
                players: [player],
                draft: {
                  players: [],
                  teams: 12,
                  pick: 1,
                  complete: false,
                },
                slots: DEFAULT_SLOTS,
              },
            })
            setIsAddTeamModalOpen(false)
          }}
        >
          <p>create new team with player</p>
          <input
            type='text'
            className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
            placeholder='name'
            value={newTeamName}
            onChange={e => {
              setNewTeamName(e.target.value)
            }}
          />
          <div className='flex items-center gap-4'>
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2 disabled:pointer-events-none disabled:opacity-25'
              type='submit'
              disabled={newTeamName === ''}
            >
              <ArrowDownOnSquareIcon className='h-6 w-6' /> save
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal
        title={`delete ${name}`}
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        action={() => {
          deletePlayerByIndex(playerIndex)
          navigate({ to: '/players', search: { q: undefined } })
        }}
      >
        delete {name}?
      </ConfirmModal>
    </>
  )
}
