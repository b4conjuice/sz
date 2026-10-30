import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid'

import Menu from '@/components/menu'
import Modal from '@/components/modal'
import { useTeams } from '@/lib/use-teams'
import ConfirmModal from '@/components/confirm-modal'

export const Route = createFileRoute('/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false)
  const { teams, saveTeam, deleteTeamByIndex } = useTeams()
  const [newTeamName, setNewTeamName] = useState('')
  const [teamToBeDeletedIndex, setTeamToBeDeletedIndex] = useState<
    number | null
  >(null)
  const teamToBeDeleted =
    teamToBeDeletedIndex !== null ? teams[teamToBeDeletedIndex] : null
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        {teams.length === 0 ? (
          <p>no teams yet</p>
        ) : (
          <ul className='divide-cb-dusty-blue divide-y'>
            {teams.map((team, index) => (
              <li
                key={index}
                className='flex items-center gap-2 py-4 first:pt-0'
              >
                <Link
                  to='/teams/$teamIndex'
                  params={{
                    teamIndex: String(index),
                  }}
                  className='text-cb-pink hover:text-cb-pink/75 flex grow items-center justify-between'
                >
                  {team.name}
                </Link>
                <button
                  className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
                  onClick={() => {
                    setTeamToBeDeletedIndex(index)
                    setIsConfirmModalOpen(true)
                  }}
                >
                  <TrashIcon className='h-6 w-6' />
                </button>
              </li>
            ))}
          </ul>
        )}
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
              setIsAddTeamModalOpen(true)
            }}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
        </div>
      </footer>
      <Modal
        title='add team'
        isOpen={isAddTeamModalOpen}
        setIsOpen={setIsAddTeamModalOpen}
      >
        <input
          type='text'
          className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
          placeholder='name'
          value={newTeamName}
          onChange={e => {
            setNewTeamName(e.target.value)
          }}
        />
        <div className='flex items-center gap-4'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              saveTeam({
                team: {
                  name: newTeamName,
                  players: [],
                },
              })
              setIsAddTeamModalOpen(false)
              // TODO: go to team page?
            }}
            disabled={newTeamName === ''}
          >
            save
          </button>
        </div>
      </Modal>
      {teamToBeDeletedIndex !== null && teamToBeDeleted !== null && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          setIsOpen={setIsConfirmModalOpen}
          confirmAction={() => {
            deleteTeamByIndex(teamToBeDeletedIndex)
            setIsConfirmModalOpen(false)
            setTeamToBeDeletedIndex(null)
          }}
          title={`delete ${teamToBeDeleted.name}?`}
        />
      )}
    </>
  )
}
