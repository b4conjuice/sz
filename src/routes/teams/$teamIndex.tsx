import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid'

import ConfirmModal from '@/components/confirm-modal'
import Menu from '@/components/menu'
import Modal from '@/components/modal'
import SearchPlayer from '@/components/search-player'
import type { Player } from '@/lib/use-players'
import { useTeams } from '@/lib/use-teams'

export const Route = createFileRoute('/teams/$teamIndex')({
  component: RouteComponent,
})

function AddPlayer({
  addPlayer,
  playersOnTeam,
  onPlayerAdded,
}: {
  addPlayer: (player: Player) => void
  playersOnTeam?: Player[]
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
        disabledPlayers={playersOnTeam}
      />
      <div className='flex items-center gap-4'>
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          type='button'
          onClick={() => {
            if (playerSelected) {
              addPlayer(playerToBeAdded)
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
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const { teamIndex: teamIndexParam } = Route.useParams()
  const teamIndex = Number(teamIndexParam)
  const { teams, addPlayerToTeam, deletePlayerByIndex } = useTeams()
  const addPlayer = (player: Player) => {
    addPlayerToTeam({ player, teamIndex })
  }

  const team = teams[teamIndex]
  const { name, players } = team
  const [playerToBeDeletedIndex, setPlayerToBeDeletedIndex] = useState<
    number | null
  >(null)
  const playerToBeDeleted =
    playerToBeDeletedIndex !== null ? players[playerToBeDeletedIndex] : null
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2>{name}</h2>
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
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu />
        </div>
        <div className='flex space-x-6'>
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
          playersOnTeam={team.players}
          onPlayerAdded={() => {
            setIsAddPlayerModalOpen(false)
          }}
        />
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
    </>
  )
}
