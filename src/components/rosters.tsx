import { useState } from 'react'
import { Cog6ToothIcon } from '@heroicons/react/20/solid'

import ImportExport from '@/components/import-export'
import Modal from '@/components/modal'
import type { RosterTeam } from '@/lib/scripts'
import type { Team } from '@/lib/use-teams'

const formatDate = (date: Date) =>
  new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

export default function Rosters({
  team,
  updateTeam,
}: {
  team: Team
  updateTeam: (updates: Partial<Team>) => void
}) {
  const [isRostersSettingsModalOpen, setIsRostersSettingsModalOpen] =
    useState(false)
  return (
    <>
      <div className='flex'>
        <h2 className='grow'>rosters</h2>
        <div className='flex space-x-6'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              setIsRostersSettingsModalOpen(true)
            }}
          >
            <Cog6ToothIcon className='h-6 w-6' />
          </button>
        </div>
      </div>
      <p className='opacity-75'>
        {team.rostersUpdatedAt
          ? `last updated ${formatDate(team.rostersUpdatedAt)}`
          : 'not imported yet'}
      </p>
      <Modal
        title='rosters'
        isOpen={isRostersSettingsModalOpen}
        setIsOpen={setIsRostersSettingsModalOpen}
      >
        <ImportExport
          object={team.rosters}
          setObject={(newRosters: RosterTeam[] | undefined) => {
            updateTeam({ rosters: newRosters, rostersUpdatedAt: new Date() })
            setIsRostersSettingsModalOpen(false)
          }}
        />
      </Modal>
    </>
  )
}
