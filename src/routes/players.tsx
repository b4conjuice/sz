import { useEffect, useState } from 'react'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import {
  ArrowDownOnSquareIcon,
  CodeBracketIcon,
} from '@heroicons/react/20/solid'
import classNames from 'classnames'
import { useCopyToClipboard, useLocalStorage } from '@uidotdev/usehooks'

import Menu from '@/components/menu'
import Modal from '@/components/modal'
import useSearch from '@/lib/use-search'
import { usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'
import { PLAYERS_SCRIPT } from '@/lib/config'
import CommandPalette from '@/components/command-palette-with-navigation'

export const Route = createFileRoute('/players')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'players' }],
  }),
  validateSearch: (search: Record<string, string>) => {
    return {
      q: search.q ? String(search.q) : undefined,
    }
  },
})

const routeApi = getRouteApi('/players')

function RouteComponent() {
  const [copiedText, copyToClipboard] = useCopyToClipboard()
  const { q } = Route.useSearch()
  const query = q ?? ''
  const navigate = routeApi.useNavigate()
  const [isOverwritePlayersModalOpen, setIsOverwritePlayersModalOpen] =
    useState(false)
  const { players, overwritePlayers } = usePlayers()
  const [newPlayersAsString, setNewPlayersAsString] = useState(
    JSON.stringify(players)
  )

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

  const [selectedTags, setSelectedTags] = useLocalStorage<string[]>(
    'sz-players-selected-positions',
    []
  )
  const allTags = [
    ...new Set(
      players.reduce((currentAllTags: string[], player: Player) => {
        const { position } = player
        const playerTags = [...position]
        return [...currentAllTags, ...playerTags]
      }, selectedTags)
    ),
  ]

  const taggedPlayers = results.filter(player =>
    selectedTags.length > 0
      ? selectedTags.every(tag => player.position.includes(tag))
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
        {allTags.length > 0 && (
          <ul className='flex space-x-2 overflow-x-auto'>
            {allTags.map((tag, index) => (
              <li key={tag}>
                <button
                  // ref={index === 0 ? firstTagButtonRef : undefined}
                  className={classNames(
                    'bg-cb-blue rounded-lg border p-2',
                    selectedTags.includes(tag)
                      ? 'border-cb-pink'
                      : 'border-cb-blue'
                  )}
                  onClick={() => {
                    const selectedTagIndex = selectedTags.findIndex(
                      t => t === tag
                    )
                    const newSelectedTags = [...selectedTags]
                    if (selectedTagIndex > -1) {
                      newSelectedTags.splice(selectedTagIndex, 1)
                    } else {
                      newSelectedTags.push(tag)
                    }
                    setSelectedTags(newSelectedTags)
                  }}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        )}
        {taggedPlayers.length === 0 && (search || selectedTags.length > 0) && (
          <p>no results found</p>
        )}
        <ul className='divide-cb-dusty-blue divide-y'>
          {taggedPlayers.map((player, index) => {
            const rank = index + 1
            return (
              <li key={index} className='flex gap-2 py-4 first:pt-0'>
                <span>{rank}</span>
                <span>{player.name}</span>
                <span>{player.position.join(', ')}</span>
              </li>
            )
          })}
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
              setIsOverwritePlayersModalOpen(true)
            }}
          >
            <CodeBracketIcon className='h-6 w-6' />
          </button>
        </div>
      </footer>
      <Modal
        title='overwrite players'
        isOpen={isOverwritePlayersModalOpen}
        setIsOpen={setIsOverwritePlayersModalOpen}
      >
        <button
          className='text-cb-yellow hover:text-cb-yellow/75'
          onClick={async () => {
            await copyToClipboard(PLAYERS_SCRIPT)
          }}
        >
          copy players script
        </button>
        <textarea
          className='border-cobalt bg-cobalt caret-cb-yellow focus:border-cb-light-blue text-cb-white h-full w-full grow focus:ring-0'
          value={newPlayersAsString}
          onChange={e => {
            setNewPlayersAsString(e.target.value)
          }}
        />
        <div className='flex items-center gap-4'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            onClick={() => {
              overwritePlayers([])
            }}
            disabled={JSON.stringify(players) === JSON.stringify([])}
          >
            reset
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              overwritePlayers(JSON.parse(newPlayersAsString).flat())
            }}
            disabled={
              JSON.stringify(players) ===
              JSON.stringify(JSON.parse(newPlayersAsString).flat())
            }
          >
            <ArrowDownOnSquareIcon className='h-6 w-6' />
          </button>
        </div>
      </Modal>
      <CommandPalette commands={[]} />
    </>
  )
}
