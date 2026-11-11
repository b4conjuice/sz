import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowDownOnSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'
import { useHotkey } from '@tanstack/react-hotkeys'

import Menu from '@/components/menu'
import Modal from '@/components/modal'
import { createTeam, useTeams } from '@/lib/use-teams'
import ConfirmModal from '@/components/confirm-modal'
import { DEFAULT_TITLE } from '@/routes/__root'

export const Route = createFileRoute('/teams/')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: `teams - ${DEFAULT_TITLE}` }],
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false)
  const { teams, saveTeam, deleteTeamByIndex } = useTeams()
  const [newTeamName, setNewTeamName] = useState('')
  const [teamToBeDeletedIndex, setTeamToBeDeletedIndex] = useState<
    number | null
  >(null)
  const teamToBeDeleted =
    teamToBeDeletedIndex !== null ? teams[teamToBeDeletedIndex] : null
  useHotkey('A', () => {
    setIsAddTeamModalOpen(true)
  })
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
          <Menu
            navigationCommands={teams.map((team, index) => ({
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
        <form
          className='space-y-3'
          onSubmit={e => {
            e.preventDefault()
            saveTeam({
              team: createTeam(newTeamName),
            })
            setNewTeamName('')
            setIsAddTeamModalOpen(false)
            navigate({
              to: '/teams/$teamIndex',
              params: {
                teamIndex: String(teams.length),
              },
            })
          }}
        >
          <input
            type='text'
            autoFocus
            className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
            placeholder='name'
            value={newTeamName}
            onChange={e => {
              setNewTeamName(e.target.value)
            }}
          />
          <div className='flex items-center gap-4'>
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2 disabled:pointer-events-none disabled:opacity-25'
              type='submit'
              disabled={newTeamName === ''}
            >
              <ArrowDownOnSquareIcon className='h-6 w-6' /> save
            </button>
          </div>
        </form>
      </Modal>
      {teamToBeDeletedIndex !== null && teamToBeDeleted !== null && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          setIsOpen={setIsConfirmModalOpen}
          action={() => {
            deleteTeamByIndex(teamToBeDeletedIndex)
            setIsConfirmModalOpen(false)
            setTeamToBeDeletedIndex(null)
          }}
        >
          delete {teamToBeDeleted.name}?
        </ConfirmModal>
      )}
      {/* <CommandPalette
        commands={[
          {
            id: 'add-team',
            title: 'add team',
            action: () => {
              setIsAddTeamModalOpen(true)
            },
          },
        ]}
      /> */}
    </>
  )
}
