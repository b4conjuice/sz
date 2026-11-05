import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
import SearchPlayer from '@/components/search-player'
import { usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'
import { getTeams, useTeams } from '@/lib/use-teams'
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
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false)
  const [isDraftPlayerModalOpen, setIsDraftPlayerModalOpen] = useState(false)
  const [isDraftSettingsModalOpen, setIsDraftSettingsModalOpen] =
    useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isConfirmClearDraftModalOpen, setIsConfirmClearDraftModalOpen] =
    useState(false)
  const { teamIndex: teamIndexParam } = Route.useParams()
  const teamIndex = Number(teamIndexParam)
  const {
    teams,
    addPlayerToTeam,
    deletePlayerByIndex,
    addPlayerToDraft,
    deletePlayerFromDraftByIndex,
    toggleCompleteDraft,
    overwriteDraft,
  } = useTeams()
  const { players: playerList } = usePlayers()
  const team = teams[teamIndex]
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
  const [playerToBeDeletedIndex, setPlayerToBeDeletedIndex] = useState<
    number | null
  >(null)
  const playerToBeDeleted =
    playerToBeDeletedIndex !== null ? players[playerToBeDeletedIndex] : null
  const [newDraft, setNewDraft] = useState(draft)
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2>{name}</h2>
        <h2>depth</h2>
        <Depth team={team} />
        <h2>roster</h2>
        <ul className='divide-cb-dusty-blue divide-y'>
          {players.map((player, playerIndex) => (
            <li key={playerIndex} className='flex py-4 first:pt-0'>
              <span className='flex grow gap-2'>
                <span>{player.name}</span>
                <span>{player.position.join(', ')}</span>
              </span>
              <button
                className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
                onClick={() => {
                  setPlayerToBeDeletedIndex(playerIndex)
                  setIsConfirmModalOpen(true)
                }}
              >
                <TrashIcon className='h-6 w-6' />
              </button>
            </li>
          ))}
        </ul>
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
                setIsDraftPlayerModalOpen(true)
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
              setIsAddPlayerModalOpen(true)
            }}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
        </div>
      </footer>
      <Modal
        title='add player'
        isOpen={isAddPlayerModalOpen}
        setIsOpen={setIsAddPlayerModalOpen}
      >
        <AddPlayer
          addPlayer={addPlayer}
          disabledPlayers={team.players}
          onPlayerAdded={() => {
            setIsAddPlayerModalOpen(false)
          }}
        />
      </Modal>
      <Modal
        title='draft player'
        isOpen={isDraftPlayerModalOpen}
        setIsOpen={setIsDraftPlayerModalOpen}
      >
        <AddPlayer
          addPlayer={draftPlayer}
          disabledPlayers={team.draft?.players}
          onPlayerAdded={() => {
            setIsDraftPlayerModalOpen(false)
          }}
        />
      </Modal>
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
            overwriteDraft({
              teamIndex,
              draft: newDraft,
            })
          }}
          disabled={
            newDraft?.teams === draft?.teams && newDraft?.pick === draft?.pick
          }
        >
          save
        </button>
      </Modal>
      {playerToBeDeletedIndex !== null && playerToBeDeleted !== null && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          setIsOpen={setIsConfirmModalOpen}
          confirmAction={() => {
            deletePlayerByIndex({
              teamIndex,
              playerIndex: playerToBeDeletedIndex,
            })
          }}
          title={`drop ${playerToBeDeleted.name}?`}
        />
      )}
      <ConfirmModal
        isOpen={isConfirmClearDraftModalOpen}
        setIsOpen={setIsConfirmClearDraftModalOpen}
        confirmAction={() => {
          overwriteDraft({ teamIndex, draft: undefined })
        }}
        title='clear draft?'
      />
      <CoreCommandPalette
        toggleIsOpenHotKey={'A'}
        placeholder='add player'
        commands={[
          ...playerList.map((player, index) => ({
            id: `add-player-${index}`,
            title: `add ${player.name} - ${player.position.join(', ')}`,
            action: () => {
              addPlayer(player)
            },
          })),
        ]}
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
      />
    </>
  )
}
