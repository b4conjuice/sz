import { useEffect, useState } from 'react'
import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'
import { PlusIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import { useLocalStorage } from '@uidotdev/usehooks'

import Menu from '@/components/menu'
import NewPlayerModal from '@/components/new-player-modal'
import useSearch from '@/lib/use-search'
import { usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'
import { DEFAULT_TITLE } from '@/routes/__root'

export const Route = createFileRoute('/players/')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: `players - ${DEFAULT_TITLE}` }],
  }),
  validateSearch: (search: Record<string, string>) => {
    return {
      q: search.q ? String(search.q) : undefined,
    }
  },
})

const routeApi = getRouteApi('/players/')

function RouteComponent() {
  const { q } = Route.useSearch()
  const query = q ?? ''
  const navigate = routeApi.useNavigate()
  const { players, savePlayer } = usePlayers()
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false)

  const { search, setSearch, results } = useSearch({
    initialSearch: query,
    list: players,
    options: {
      keys: ['name'],
    },
  })

  useEffect(() => {
    navigate({
      search: { q: search || undefined },
    })
  }, [search, navigate])

  const [selectedPositions, setSelectedPositions] = useLocalStorage<string[]>(
    'sz-players-selected-positions',
    []
  )
  const positions = [
    ...players.reduce((currentAllTags: string[], player: Player) => {
      const { position } = player
      const playerTags = [...position]
      return [...currentAllTags, ...playerTags]
    }, selectedPositions),
  ]
  const allPositionTags = [...new Set([...positions, 'no-position'])]

  const [selectedTeams, setSelectedTeams] = useLocalStorage<string[]>(
    'sz-players-selected-teams',
    []
  )
  const teams = [
    ...players.reduce((currentAllTags: string[], player: Player) => {
      const { team } = player
      return [...currentAllTags, team]
    }, selectedTeams),
  ].filter(team => Boolean(team))
  const allTeamTags = [...new Set([...teams, 'no-team'])]

  const taggedPlayers = results
    .filter(player =>
      selectedPositions.length > 0
        ? selectedPositions.every(tag =>
            tag === 'no-position'
              ? player.position.length === 0
              : player.position.includes(tag)
          )
        : true
    )
    .filter(player =>
      selectedTeams.length > 0
        ? selectedTeams.every(tag =>
            tag === 'no-team' ? player.team === '' : player.team === tag
          )
        : true
    )
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <div className='flex'>
          <input
            type='text'
            className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
            placeholder='search'
            value={search}
            onChange={e => {
              setSearch(e.target.value)
            }}
          />
        </div>
        {allPositionTags.length > 0 && (
          <ul className='flex gap-2 overflow-x-auto'>
            {allPositionTags.map(tag => (
              <li key={tag}>
                <button
                  className={classNames(
                    'bg-cb-blue rounded-lg border p-2 text-nowrap',
                    selectedPositions.includes(tag)
                      ? 'border-cb-pink'
                      : 'border-cb-blue'
                  )}
                  onClick={() => {
                    const selectedTagIndex = selectedPositions.findIndex(
                      t => t === tag
                    )
                    const newSelectedTags = [...selectedPositions]
                    if (selectedTagIndex > -1) {
                      newSelectedTags.splice(selectedTagIndex, 1)
                    } else {
                      newSelectedTags.push(tag)
                    }
                    setSelectedPositions(newSelectedTags)
                  }}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        )}
        {allTeamTags.length > 0 && (
          <ul className='flex gap-2 overflow-x-auto'>
            {allTeamTags.map(tag => (
              <li key={tag}>
                <button
                  className={classNames(
                    'bg-cb-blue rounded-lg border p-2 text-nowrap',
                    selectedTeams.includes(tag)
                      ? 'border-cb-pink'
                      : 'border-cb-blue'
                  )}
                  onClick={() => {
                    const selectedTagIndex = selectedTeams.findIndex(
                      t => t === tag
                    )
                    const newSelectedTags = [...selectedTeams]
                    if (selectedTagIndex > -1) {
                      newSelectedTags.splice(selectedTagIndex, 1)
                    } else {
                      newSelectedTags.push(tag)
                    }
                    setSelectedTeams(newSelectedTags)
                  }}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        )}
        {taggedPlayers.length === 0 &&
          (search || selectedPositions.length > 0) && <p>no results found</p>}
        <ul className='divide-cb-dusty-blue divide-y'>
          {taggedPlayers.map(player => {
            const index = players.indexOf(player)
            const rank = index + 1
            return (
              <li key={index} className='flex gap-2 py-4 first:pt-0'>
                <Link
                  to='/players/$playerIndex'
                  params={{
                    playerIndex: String(index),
                  }}
                  className='text-cb-pink hover:text-cb-pink/75 flex grow items-baseline gap-2'
                >
                  <span>{rank}</span>
                  <span>{player.name}</span>
                  <span>{player.position.join(', ')}</span>
                  <span className='text-sm'>{player.team}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu
            navigationCommands={players.map((player, index) => ({
              id: `go-${player.name}`,
              title: `go ${player.name}`,
              action: () => {
                navigate({
                  to: '/players/$playerIndex',
                  params: {
                    playerIndex: String(index),
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
              setIsAddPlayerModalOpen(true)
            }}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
        </div>
      </footer>
      <NewPlayerModal
        isOpen={isAddPlayerModalOpen}
        setIsOpen={setIsAddPlayerModalOpen}
        playerList={players}
        title='add player'
        onSubmit={player => {
          savePlayer({ player })
        }}
      />
    </>
  )
}
