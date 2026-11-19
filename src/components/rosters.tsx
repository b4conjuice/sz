import { useEffect, useState } from 'react'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { useCopyToClipboard, useLocalStorage } from '@uidotdev/usehooks'
import {
  CheckIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/20/solid'
import classNames from 'classnames'

import ImportExport from '@/components/import-export'
import Modal from '@/components/modal'
import { Roster } from '@/components/roster'
import type { Player } from '@/lib/use-players'
import { ROSTERS_SCRIPT } from '@/lib/scripts'
import type { RosterTeam } from '@/lib/scripts'
import { DEFAULT_SLOTS, fillSlotsWithPlayers } from '@/lib/use-teams'
import type { Team } from '@/lib/use-teams'

const noop = () => undefined

const formatDate = (date: Date) =>
  new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

function RosterDisplay({
  roster,
  playerList,
}: {
  roster: RosterTeam
  playerList: Player[]
}) {
  const players: Player[] = roster.players.map(name => {
    const player = playerList.find(currentPlayer => currentPlayer.name === name)
    return player ?? { name, team: '', position: [] }
  })
  const rosterTeam: Team = {
    name: roster.name,
    players,
    slots: fillSlotsWithPlayers(DEFAULT_SLOTS, players),
  }
  return (
    <Roster
      readOnly
      team={rosterTeam}
      teamIndex={-1}
      playerList={playerList}
      addPlayerToTeam={noop}
      replacePlayerOnTeam={noop}
      deletePlayerByIndex={noop}
      savePlayer={noop}
      saveTeam={noop}
    />
  )
}

export default function Rosters({
  team,
  updateTeam,
  playerList,
}: {
  team: Team
  updateTeam: (updates: Partial<Team>) => void
  playerList: Player[]
}) {
  const [isRostersSettingsModalOpen, setIsRostersSettingsModalOpen] =
    useState(false)
  const [savedScript] = useLocalStorage('sz-script-rosters', ROSTERS_SCRIPT)
  const [, copyToClipboard] = useCopyToClipboard()
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timeout = setTimeout(() => setIsCopied(false), 1500)
    return () => clearTimeout(timeout)
  }, [isCopied])

  const rosters = [...(team.rosters ?? [])].sort(
    (a, b) => Number(a.isOpponent) - Number(b.isOpponent)
  )
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
      {rosters.length === 0 ? (
        <p className='opacity-75'>no rosters imported yet</p>
      ) : (
        <div className='divide-cb-dusty-blue divide-y'>
          {rosters.map(roster => (
            <Disclosure key={roster.name} as='div' className='py-2 first:pt-0'>
              {({ open }) => (
                <>
                  <DisclosureButton className='flex w-full items-center gap-2 text-left'>
                    <span className='grow'>{roster.name}</span>
                    <ChevronDownIcon
                      className={classNames(
                        'h-5 w-5 transition-transform',
                        open && 'rotate-180'
                      )}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className='pt-1'>
                    <RosterDisplay roster={roster} playerList={playerList} />
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      )}
      <Modal
        title='rosters'
        isOpen={isRostersSettingsModalOpen}
        setIsOpen={setIsRostersSettingsModalOpen}
      >
        <button
          type='button'
          title='copy rosters script'
          className='text-cb-yellow hover:text-cb-yellow/75 flex gap-2'
          onClick={async () => {
            await copyToClipboard(savedScript || ROSTERS_SCRIPT)
            setIsCopied(true)
          }}
        >
          {isCopied ? (
            <>
              <CheckIcon className='h-6 w-6' /> copied
            </>
          ) : (
            <>
              <DocumentDuplicateIcon className='h-6 w-6' /> copy rosters script
            </>
          )}
        </button>
        <hr className='border-cb-white/25' />
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
