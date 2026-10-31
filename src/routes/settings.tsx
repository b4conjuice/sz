import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useCopyToClipboard } from '@uidotdev/usehooks'

import Menu from '@/components/menu'
import { useTeams } from '@/lib/use-teams'
import { usePlayers } from '@/lib/use-players'

export const Route = createFileRoute('/settings')({ component: RouteComponent })

function RouteComponent() {
  const [copiedText, copyToClipboard] = useCopyToClipboard()
  const { teams, overwriteTeams } = useTeams()
  const [newTeamsAsString, setNewTeamsAsString] = useState('[]')
  const { players, overwritePlayers } = usePlayers()
  const [newPlayersAsString, setNewPlayersAsString] = useState('[]')
  return (
    <>
      <main className='flex grow flex-col gap-4 p-2'>
        <div className='flex gap-4'>
          <h2>teams</h2>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              copyToClipboard(JSON.stringify(teams))
            }}
          >
            export
          </button>
        </div>
        <textarea
          className='border-cobalt bg-cobalt caret-cb-yellow focus:border-cb-light-blue text-cb-white w-full focus:ring-0'
          value={newTeamsAsString}
          onChange={e => {
            setNewTeamsAsString(e.target.value)
          }}
        />
        <div className='flex items-center gap-4'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              overwriteTeams(JSON.parse(newTeamsAsString).flat())
            }}
            disabled={
              JSON.stringify(teams) ===
              JSON.stringify(JSON.parse(newTeamsAsString).flat())
            }
          >
            import
          </button>
        </div>
        <hr className='border-cb-dusty-blue' />
        <div className='flex gap-4'>
          <h2>players</h2>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              copyToClipboard(JSON.stringify(players))
            }}
          >
            export
          </button>
        </div>
        <textarea
          className='border-cobalt bg-cobalt caret-cb-yellow focus:border-cb-light-blue text-cb-white w-full focus:ring-0'
          value={newPlayersAsString}
          onChange={e => {
            setNewPlayersAsString(e.target.value)
          }}
        />
        <div className='flex items-center gap-4'>
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
            import
          </button>
        </div>
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu />
        </div>
        <div className='flex space-x-6'></div>
      </footer>
    </>
  )
}
