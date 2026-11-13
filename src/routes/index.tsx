import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { PlusIcon } from '@heroicons/react/20/solid'

import CommandPalette from '@/components/command-palette'
import Menu from '@/components/menu'
import { usePlayers } from '@/lib/use-players'
import { useTeams } from '@/lib/use-teams'
import { useWatchlist } from '@/lib/use-watchlist'
import { DEFAULT_TITLE } from '@/routes/__root'

export const Route = createFileRoute('/')({
  component: Home,
  ssr: false,
  head: () => ({
    meta: [{ title: `home - ${DEFAULT_TITLE}` }],
  }),
})

function Home() {
  const navigate = useNavigate()
  const { players } = usePlayers()
  const { teams } = useTeams()
  const { watchlist, addPlayerToWatchlist } = useWatchlist()
  const [isAddPlayerCommandPaletteOpen, setIsAddPlayerCommandPaletteOpen] =
    useState(false)
  const watchlistPlayerNames = new Set(watchlist.map(player => player.name))
  const favoriteTeams = teams.slice(0, 5)
  const recentWatchlistPlayers = watchlist.slice(-5).reverse()
  return (
    <>
      <main className='flex grow flex-col justify-between gap-4 p-4'>
        <h1 className='font-bold'>sz</h1>
        <div className='flex flex-col gap-4'>
          <section className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <Link className='text-cb-pink hover:text-cb-pink/75' to='/wl'>
                watchlist
              </Link>
              <Link
                className='text-cb-pink hover:text-cb-pink/75'
                to='/players'
                search={{ q: undefined }}
              >
                all players
              </Link>
            </div>
            {recentWatchlistPlayers.length === 0 ? (
              <p>no players on your watchlist</p>
            ) : (
              <ul className='divide-cb-dusty-blue divide-y'>
                {recentWatchlistPlayers.map(player => {
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
                      className='flex items-center gap-2 py-2 first:pt-0'
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
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
          <section className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <h2>favorite teams</h2>
              <Link className='text-cb-pink hover:text-cb-pink/75' to='/teams'>
                all teams
              </Link>
            </div>
            {favoriteTeams.length === 0 ? (
              <p>no teams yet</p>
            ) : (
              <ul className='divide-cb-dusty-blue divide-y'>
                {favoriteTeams.map((team, index) => (
                  <li key={index} className='py-2 first:pt-0'>
                    <Link
                      to='/teams/$teamIndex'
                      params={{ teamIndex: String(index) }}
                      className='text-cb-pink hover:text-cb-pink/75'
                    >
                      {team.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu
            navigationCommands={favoriteTeams.map((team, index) => ({
              id: `go-${team.name}`,
              title: `go ${team.name}`,
              action: () => {
                navigate({
                  to: '/teams/$teamIndex',
                  params: {
                    teamIndex: String(index),
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
            title='add player to watchlist'
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
        placeholder='add player to watchlist'
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
    </>
  )
}
