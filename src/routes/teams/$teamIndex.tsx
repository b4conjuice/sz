import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import classNames from 'classnames'
import {
  Cog6ToothIcon,
  LockClosedIcon,
  LockOpenIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'

import ConfirmModal from '@/components/confirm-modal'
import Menu from '@/components/menu'
import Modal from '@/components/modal'
import Roster from '@/components/roster'
import SearchPlayer from '@/components/search-player'
import { usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'
import { getTeams, useTeams } from '@/lib/use-teams'
import type { Team } from '@/lib/use-teams'
import CoreCommandPalette from '@/components/command-palette'
import { Depth, Draft } from '@/components/team'
import { DEFAULT_TITLE } from '@/routes/__root'
import ImportExportModal from '@/components/import-export-modal'

export const Route = createFileRoute('/teams/$teamIndex')({
  component: RouteComponent,
  ssr: false,
  loader: ({ params }) => {
    const teams = getTeams()
    const team = teams[Number(params.teamIndex)]
    return { team }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.team
          ? `${loaderData.team.name} - ${DEFAULT_TITLE}`
          : `teams - ${DEFAULT_TITLE}`,
      },
    ],
  }),
})

function AddPlayer({
  addPlayer,
  disabledPlayers,
  onPlayerAdded,
}: {
  addPlayer: (player: Player) => void
  disabledPlayers?: Player[]
  onPlayerAdded?: () => void
}) {
  const [playerToBeAdded, setPlayerToBeAdded] = useState<Player | null>(null)
  const playerSelected = playerToBeAdded !== null
  return (
    <>
      <SearchPlayer
        onSelectPlayer={player => {
          setPlayerToBeAdded(player)
        }}
        disabledPlayers={disabledPlayers}
      />
      <div className='flex items-center gap-4'>
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          type='button'
          onClick={() => {
            if (playerSelected) {
              addPlayer(playerToBeAdded)
              setPlayerToBeAdded(null)
              if (onPlayerAdded) {
                onPlayerAdded()
              }
            }
          }}
          disabled={!playerSelected}
        >
          add{playerSelected ? ` ${playerToBeAdded.name}` : ''}
        </button>
      </div>
    </>
  )
}

function RouteComponent() {
  const navigate = useNavigate()
  const [isAddPlayerCommandPaletteOpen, setIsAddPlayerCommandPaletteOpen] =
    useState(false)
  const [isDraftPlayerCommandPaletteOpen, setIsDraftPlayerCommandPaletteOpen] =
    useState(false)
  const [isDraftSettingsModalOpen, setIsDraftSettingsModalOpen] =
    useState(false)
  const [isConfirmClearDraftModalOpen, setIsConfirmClearDraftModalOpen] =
    useState(false)
  const { teamIndex: teamIndexParam } = Route.useParams()
  const teamIndex = Number(teamIndexParam)
  const {
    teams,
    saveTeam,
    addPlayerToTeam,
    deletePlayerByIndex,
    addPlayerToDraft,
    deletePlayerFromDraftByIndex,
    toggleCompleteDraft,
    overwriteDraft,
  } = useTeams()
  const { players: playerList, savePlayer } = usePlayers()
  const [isAddNewPlayerModalOpen, setIsAddNewPlayerModalOpen] = useState(false)
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
      ...playerList.reduce(
        (currentAllTags: string[], currentPlayer: Player) => {
          const { position } = currentPlayer
          return [...currentAllTags, ...position]
        },
        []
      ),
    ]),
  ]
  const playerTeams = [
    ...new Set(
      playerList.reduce((currentTeams: string[], currentPlayer: Player) => {
        return [...currentTeams, currentPlayer.team]
      }, [])
    ),
  ].filter(team => Boolean(team))
  const team = teams.at(teamIndex)
  if (!team) {
    return <p>team does not exist</p>
  }
  const addPlayer = (player: Player) => {
    addPlayerToTeam({ player, teamIndex })
  }
  const draftPlayer = (player: Player) => {
    addPlayerToDraft({ player, teamIndex })
  }

  const { name, players, draft } = team
  const [newDraft, setNewDraft] = useState(draft)
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2>{name}</h2>
        <h2>depth</h2>
        <Depth team={team} />
        <Roster
          team={team}
          saveTeam={newTeam => {
            saveTeam({
              team: newTeam,
              index: teamIndex,
            })
          }}
        />
        <div className='flex'>
          <h2 className='grow'>draft</h2>
          <div className='flex space-x-6'>
            <button
              className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
              onClick={() => {
                setIsConfirmClearDraftModalOpen(true)
              }}
              disabled={!draft || draft.complete}
            >
              <TrashIcon className='h-6 w-6' />
            </button>
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              onClick={() => {
                toggleCompleteDraft(teamIndex)
              }}
              disabled={!draft}
            >
              {draft?.complete ? (
                <LockClosedIcon className='h-6 w-6' />
              ) : (
                <LockOpenIcon className='h-6 w-6' />
              )}
            </button>
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              onClick={() => {
                setNewDraft(draft)
                setIsDraftSettingsModalOpen(true)
              }}
              disabled={!draft || draft.complete}
            >
              <Cog6ToothIcon className='h-6 w-6' />
            </button>
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              type='button'
              onClick={() => {
                setIsDraftPlayerCommandPaletteOpen(true)
              }}
              disabled={draft?.complete}
            >
              <PlusIcon className='h-6 w-6' />
            </button>
          </div>
        </div>
        {draft && <Draft draft={draft} />}
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu
            navigationCommands={players.map(player => ({
              id: `go-${player.name}`,
              title: `go ${player.name}`,
              action: () => {
                navigate({
                  to: '/players/$playerIndex',
                  params: {
                    playerIndex: String(
                      playerList.findIndex(p => p.name === player.name)
                    ),
                  },
                })
              },
            }))}
          />
        </div>
        <div className='flex space-x-6'>
          <ImportExportModal
            object={team}
            setObject={(newTeam: Team) => {
              saveTeam({
                index: teamIndex,
                team: newTeam,
              })
            }}
          />
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              setIsAddPlayerCommandPaletteOpen(true)
            }}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
        </div>
      </footer>
      <Modal
        title='draft settings'
        isOpen={isDraftSettingsModalOpen}
        setIsOpen={setIsDraftSettingsModalOpen}
      >
        <label htmlFor='teams'>
          teams
          <input
            className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
            type='number'
            value={newDraft?.teams}
            onChange={e => {
              setNewDraft(prev => {
                if (!prev) {
                  return prev
                }
                return {
                  ...prev,
                  teams: Number(e.target.value),
                }
              })
            }}
          />
        </label>
        <label htmlFor='pick'>
          pick
          <input
            className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
            type='number'
            value={newDraft?.pick}
            onChange={e => {
              setNewDraft(prev => {
                if (!prev) {
                  return prev
                }
                return {
                  ...prev,
                  pick: Number(e.target.value),
                }
              })
            }}
          />
        </label>
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          type='button'
          onClick={() => {
            if (!newDraft || !draft) {
              return
            }
            overwriteDraft({
              teamIndex,
              draft: {
                ...draft,
                teams: newDraft.teams,
                pick: newDraft.pick,
              },
            })
          }}
          disabled={
            newDraft?.teams === draft?.teams && newDraft?.pick === draft?.pick
          }
        >
          save
        </button>
      </Modal>
      <ConfirmModal
        isOpen={isConfirmClearDraftModalOpen}
        setIsOpen={setIsConfirmClearDraftModalOpen}
        action={() => {
          overwriteDraft({ teamIndex, draft: undefined })
        }}
      >
        clear draft?
      </ConfirmModal>
      <CoreCommandPalette
        toggleIsOpenHotKey={'A'}
        placeholder='add player'
        commands={[
          {
            id: 'add-new-player',
            title: 'create new player',
            action: () => {
              setIsAddNewPlayerModalOpen(true)
            },
          },
          ...playerList.map((player, index) => ({
            id: `add-player-${index}`,
            title: `add ${player.name} - ${player.position.join(', ')}`,
            action: () => {
              addPlayer(player)
            },
          })),
        ]}
        isOpen={isAddPlayerCommandPaletteOpen}
        setIsOpen={setIsAddPlayerCommandPaletteOpen}
      />
      <CoreCommandPalette
        toggleIsOpenHotKey={'R'}
        placeholder='drop player'
        commands={[
          ...players.map((player, index) => ({
            id: `drop-player-${index}`,
            title: `draft ${player.name} - ${player.position.join(', ')}`,
            action: () => {
              deletePlayerByIndex({
                teamIndex,
                playerIndex: index,
              })
            },
          })),
        ]}
      />
      {!draft?.complete && (
        <CoreCommandPalette
          toggleIsOpenHotKey={'D'}
          placeholder='draft player'
          commands={[
            ...playerList.map((player, index) => ({
              id: `draft-player-${index}`,
              title: `draft ${player.name} - ${player.position.join(', ')}`,
              action: () => {
                draftPlayer(player)
              },
            })),
          ]}
          isOpen={isDraftPlayerCommandPaletteOpen}
          setIsOpen={setIsDraftPlayerCommandPaletteOpen}
        />
      )}
      <Modal
        title='create new player'
        isOpen={isAddNewPlayerModalOpen}
        setIsOpen={setIsAddNewPlayerModalOpen}
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
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              savePlayer({ player: newPlayer })
              addPlayer(newPlayer)
              setNewPlayer({ name: '', team: '', position: [] })
              setIsAddNewPlayerModalOpen(false)
            }}
            disabled={newPlayer.name === '' || newPlayer.team === ''}
          >
            save
          </button>
        </div>
      </Modal>
    </>
  )
}
