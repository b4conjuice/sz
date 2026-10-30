import { useState } from 'react'
import classNames from 'classnames'

import { usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'
import useSearch from '@/lib/use-search'

const RESULTS_LIMIT = 5

export default function SearchPlayer({
  onSelectPlayer,
  disabledPlayers,
}: {
  onSelectPlayer: (player: Player) => void
  disabledPlayers?: Player[]
}) {
  const { players } = usePlayers()
  const { search, setSearch, results } = useSearch({
    initialSearch: '',
    list: players,
    options: {
      keys: ['name'],
    },
  })

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const allTags = [
    ...new Set(
      players.reduce((currentAllTags: string[], player: Player) => {
        const { position } = player
        const playerTags = [...position]
        return [...currentAllTags, ...playerTags]
      }, selectedTags)
    ),
  ]

  const taggedPlayers = results
    .filter(player =>
      selectedTags.length > 0
        ? selectedTags.every(tag => player.position.includes(tag))
        : true
    )
    .splice(0, RESULTS_LIMIT)
  return (
    <>
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
            <li key={index} className=''>
              <button
                type='button'
                onClick={() => {
                  onSelectPlayer(player)
                }}
                className='flex gap-2 py-4 first:pt-0 disabled:pointer-events-none disabled:opacity-25'
                disabled={disabledPlayers
                  ?.map(p => p.name)
                  .includes(player.name)}
              >
                <span>{rank}</span>
                <span>{player.name}</span>
                <span>{player.position.join(', ')}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
