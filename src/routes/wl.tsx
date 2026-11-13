import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid'

import CommandPalette from '@/components/command-palette'
import ImportExportModal from '@/components/import-export-modal'
import Menu from '@/components/menu'
import Modal from '@/components/modal'
import type { Player } from '@/lib/use-players'
import { usePlayers } from '@/lib/use-players'
import { useTeams } from '@/lib/use-teams'
import { useWatchlist } from '@/lib/use-watchlist'
import { DEFAULT_TITLE } from '@/routes/__root'

export const Route = createFileRoute('/wl')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: `watchlist - ${DEFAULT_TITLE}` }],
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { players } = usePlayers()
  const { teams, addPlayerToTeam } = useTeams()
  const {
    watchlist,
    overwriteWatchlist,
    addPlayerToWatchlist,
    removePlayerFromWatchlist,
  } = useWatchlist()
  const [isAddPlayerCommandPaletteOpen, setIsAddPlayerCommandPaletteOpen] =
    useState(false)
  const [playerToAddToTeam, setPlayerToAddToTeam] = useState<Player | null>(
    null
  )
  const [isAddToTeamModalOpen, setIsAddToTeamModalOpen] = useState(false)
  const watchlistPlayerNames = new Set(watchlist.map(player => player.name))
  const teamsWithoutPlayer = playerToAddToTeam
    ? teams.filter(
        team =>
          !team.players.some(player => player.name === playerToAddToTeam.name)
      )
    : []
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        {watchlist.length === 0 ? (
          <p>no players on your watchlist</p>
        ) : (
          <ul className='divide-cb-dusty-blue divide-y'>
            {watchlist.map(player => {
              const playerIndex = players.findIndex(
                currentPlayer => currentPlayer.name === player.name
              )
              const playerDetails = (
                <>
                  <span>{player.name}</span>
                  <span>{player.position.join(', ')}</span>
                  <span className='text-sm'>{player.team}</span>
                </>
              )
              return (
                <li
                  key={player.name}
                  className='flex items-center gap-2 py-4 first:pt-0'
                >
                  {playerIndex > -1 ? (
                    <Link
                      to='/players/$playerIndex'
                      params={{
                        playerIndex: String(playerIndex),
                      }}
                      className='text-cb-pink hover:text-cb-pink/75 flex grow items-baseline gap-2'
                    >
                      {playerDetails}
                    </Link>
                  ) : (
                    <span className='flex grow items-baseline gap-2'>
                      {playerDetails}
                    </span>
                  )}
                  <button
                    className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
                    type='button'
                    title='add to team'
                    onClick={() => {
                      setPlayerToAddToTeam(player)
                      setIsAddToTeamModalOpen(true)
                    }}
                  >
                    <PlusIcon className='h-6 w-6' />
                  </button>
                  <button
                    className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
                    type='button'
                    title='remove from watchlist'
                    onClick={() => {
                      removePlayerFromWatchlist(player.name)
                    }}
                  >
                    <TrashIcon className='h-6 w-6' />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu
            navigationCommands={watchlist.flatMap(player => {
              const playerIndex = players.findIndex(
                currentPlayer => currentPlayer.name === player.name
              )
              return playerIndex > -1
                ? [
                    {
                      id: `go-${player.name}`,
                      title: `go ${player.name}`,
                      action: () => {
                        navigate({
                          to: '/players/$playerIndex',
                          params: {
                            playerIndex: String(playerIndex),
                          },
                        })
                      },
                    },
                  ]
                : []
            })}
          />
        </div>
        <div className='flex space-x-6'>
          <ImportExportModal
            object={watchlist}
            setObject={overwriteWatchlist}
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
      <CommandPalette
        toggleIsOpenHotKey={'A'}
        placeholder='add player'
        commands={players.map((player, index) => ({
          id: `watchlist-player-${index}`,
          title: `watch ${player.name} - ${player.position.join(', ')}`,
          disabled: watchlistPlayerNames.has(player.name),
          action: () => {
            addPlayerToWatchlist(player)
          },
        }))}
        isOpen={isAddPlayerCommandPaletteOpen}
        setIsOpen={setIsAddPlayerCommandPaletteOpen}
      />
      {playerToAddToTeam && (
        <Modal
          title={`add ${playerToAddToTeam.name} to team`}
          isOpen={isAddToTeamModalOpen}
          setIsOpen={setIsAddToTeamModalOpen}
        >
          {teamsWithoutPlayer.length > 0 ? (
            <ul className='divide-cb-white/25 divide-y'>
              {teamsWithoutPlayer.map(team => (
                <li key={team.name} className='flex gap-2 py-4 first:pt-0'>
                  <button
                    className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2'
                    onClick={() => {
                      addPlayerToTeam({
                        teamIndex: teams.indexOf(team),
                        player: playerToAddToTeam,
                      })
                      setIsAddToTeamModalOpen(false)
                      setPlayerToAddToTeam(null)
                    }}
                  >
                    <PlusIcon className='h-6 w-6' /> {team.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>no teams available</p>
          )}
        </Modal>
      )}
    </>
  )
}
