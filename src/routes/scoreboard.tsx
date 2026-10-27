import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Cog6ToothIcon } from '@heroicons/react/20/solid'
import { useCopyToClipboard, useLocalStorage } from '@uidotdev/usehooks'

import Scoreboard from '@/components/scoreboard'
import Menu from '@/components/menu'
import Modal from '@/components/modal'
import { SCOREBOARD_SCRIPT } from '@/lib/config'

export const Route = createFileRoute('/scoreboard')({
  component: RouteComponent,
})

type Team = {
  name: string
  abbreviation: string
  stats: number[]
}

type Matchup = Team[]

type Scoreboard = {
  categories: string[]
  matchups: Matchup[]
}

const defaultScoreboard = {
  categories: [],
  matchups: [],
}
const catStatMap = {
  AST: 'ast',
  BLK: 'blk',
  '3PM': 'fg3m',
  'FG%': 'fg_pct',
  'FT%': 'ft_pct',
  PTS: 'pts',
  REB: 'reb',
  STL: 'stl',
  TO: 'turnover',
}

function RouteComponent() {
  const [copiedText, copyToClipboard] = useCopyToClipboard()
  const [scoreboard, setScoreboard] = useLocalStorage<Scoreboard>(
    'sz-scoreboard',
    defaultScoreboard
  )
  const { categories, matchups } = scoreboard
  const [compare, setCompare] = useState<string[]>([])
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const stats = matchups.flat().map(team => ({
    player: { last_name: team.name },
    ...team.stats.reduce((curr, stat, idx) => {
      const cat = categories[idx]
      curr[catStatMap[cat]] = cat.includes('%') ? stat * 100 : stat
      return curr
    }, {}),
  }))
  return (
    <>
      <main className='flex grow flex-col gap-4 p-2'>
        {compare.length > 0 && (
          <Scoreboard
            matchup
            stats={stats.filter(team =>
              compare.includes(team.player.last_name)
            )}
          />
        )}
        <Scoreboard stats={stats} compare={compare} setCompare={setCompare} />
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu />
        </div>
        <div className='flex space-x-6'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75'
            onClick={() => {
              setIsSettingsModalOpen(true)
            }}
          >
            <Cog6ToothIcon className='h-6 w-6' />
          </button>
        </div>
      </footer>
      <Modal
        isOpen={isSettingsModalOpen}
        setIsOpen={setIsSettingsModalOpen}
        title='scoreboard settings'
      >
        <button
          className='text-cb-yellow hover:text-cb-yellow/75'
          onClick={async () => {
            await copyToClipboard(SCOREBOARD_SCRIPT)
          }}
        >
          copy scoreboard script
        </button>
        <textarea
          className='border-cobalt bg-cobalt caret-cb-yellow focus:border-cb-light-blue text-cb-white h-full w-full grow focus:ring-0'
          value={JSON.stringify(scoreboard)}
          onChange={e => {
            setScoreboard(JSON.parse(e.target.value))
          }}
        />
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          onClick={() => {
            setScoreboard(defaultScoreboard)
          }}
          disabled={
            JSON.stringify(scoreboard) === JSON.stringify(defaultScoreboard)
          }
        >
          reset
        </button>
      </Modal>
    </>
  )
}
