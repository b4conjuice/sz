import { useEffect, useState } from 'react'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { useCopyToClipboard, useLocalStorage } from '@uidotdev/usehooks'
import {
  ArrowDownOnSquareIcon,
  CheckIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'
import classNames from 'classnames'

import ConfirmModal from '@/components/confirm-modal'
import CommandPalette from '@/components/command-palette'
import ImportExport from '@/components/import-export'
import Modal from '@/components/modal'
import { Roster } from '@/components/roster'
import type { Player } from '@/lib/use-players'
import { ROSTERS_SCRIPT } from '@/lib/scripts'
import type { RosterTeam } from '@/lib/scripts'
import { DEFAULT_SLOTS, fillSlotsWithPlayers } from '@/lib/use-teams'
import type { Team } from '@/lib/use-teams'
import { useWatchlist } from '@/lib/use-watchlist'

const noop = () => undefined

const toggleFilterValue = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter(currentValue => currentValue !== value)
    : [...values, value]

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
  removePlayer,
}: {
  roster: RosterTeam
  playerList: Player[]
  removePlayer: (playerName: string) => void
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
      onRemovePlayer={removePlayer}
    />
  )
}

function RosterFormModal({
  isOpen,
  setIsOpen,
  roster,
  rosterIndex,
  rosters,
  saveRoster,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  roster?: RosterTeam
  rosterIndex?: number
  rosters: RosterTeam[]
  saveRoster: (args: { roster: RosterTeam; index?: number }) => void
}) {
  const [name, setName] = useState('')
  const [isOpponent, setIsOpponent] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setName(roster?.name ?? '')
    setIsOpponent(roster?.isOpponent ?? false)
  }, [isOpen, roster])

  const trimmedName = name.trim()
  const isDuplicateName = rosters.some(
    (currentRoster, index) =>
      index !== rosterIndex && currentRoster.name === trimmedName
  )
  const hasChanges =
    roster === undefined ||
    trimmedName !== roster.name ||
    isOpponent !== roster.isOpponent
  return (
    <Modal
      title={roster === undefined ? 'add roster' : 'edit roster'}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <form
        className='space-y-3'
        onSubmit={e => {
          e.preventDefault()
          saveRoster({
            roster: {
              name: trimmedName,
              players: roster?.players ?? [],
              isOpponent,
            },
            index: rosterIndex,
          })
          setIsOpen(false)
        }}
      >
        <input
          type='text'
          autoFocus
          className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
          placeholder='name'
          value={name}
          onChange={e => {
            setName(e.target.value)
          }}
        />
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={isOpponent}
            onChange={e => {
              setIsOpponent(e.target.checked)
            }}
          />
          opponent
        </label>
        <div className='flex items-center gap-4'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2 disabled:pointer-events-none disabled:opacity-25'
            type='submit'
            disabled={trimmedName === '' || isDuplicateName || !hasChanges}
          >
            <ArrowDownOnSquareIcon className='h-6 w-6' /> save
          </button>
          {isDuplicateName && (
            <span className='text-red-700'>roster name already exists</span>
          )}
        </div>
      </form>
    </Modal>
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
  const [isRosterFormModalOpen, setIsRosterFormModalOpen] = useState(false)
  const [editingRosterIndex, setEditingRosterIndex] = useState<
    number | undefined
  >(undefined)
  const [isDeleteRosterModalOpen, setIsDeleteRosterModalOpen] = useState(false)
  const [rosterToDeleteIndex, setRosterToDeleteIndex] = useState<number | null>(
    null
  )
  const [isAddPlayerCommandPaletteOpen, setIsAddPlayerCommandPaletteOpen] =
    useState(false)
  const [rosterToAddPlayerIndex, setRosterToAddPlayerIndex] = useState<
    number | null
  >(null)
  const [selectedPositions, setSelectedPositions] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [watchlistOnly, setWatchlistOnly] = useState(false)
  const { watchlist } = useWatchlist()
  const watchlistPlayerNames = new Set(watchlist.map(player => player.name))
  const [savedScript] = useLocalStorage('sz-script-rosters', ROSTERS_SCRIPT)
  const [, copyToClipboard] = useCopyToClipboard()
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timeout = setTimeout(() => setIsCopied(false), 1500)
    return () => clearTimeout(timeout)
  }, [isCopied])

  const allRosters = team.rosters ?? []
  const rosters = [...allRosters].sort(
    (a, b) => Number(a.isOpponent) - Number(b.isOpponent)
  )
  const rosterToAddPlayerTo =
    rosterToAddPlayerIndex === null
      ? undefined
      : allRosters.at(rosterToAddPlayerIndex)
  const positions = [
    ...new Set([
      'PG',
      'SG',
      'SF',
      'PF',
      'C',
      ...playerList.flatMap(player => player.position),
    ]),
  ]
  const playerTeams = [
    ...new Set(playerList.map(player => player.team)),
  ].filter(playerTeam => Boolean(playerTeam))
  const filteredPlayerList = playerList.filter(
    player =>
      (selectedPositions.length === 0 ||
        selectedPositions.every(position =>
          player.position.includes(position)
        )) &&
      (selectedTeams.length === 0 ||
        selectedTeams.every(selectedTeam => player.team === selectedTeam)) &&
      (!watchlistOnly || watchlistPlayerNames.has(player.name))
  )
  const addPlayerToRoster = (playerName: string) => {
    if (rosterToAddPlayerIndex === null) return
    const roster = allRosters.at(rosterToAddPlayerIndex)
    if (!roster || roster.players.includes(playerName)) return
    const newRosters = [...allRosters]
    newRosters[rosterToAddPlayerIndex] = {
      ...roster,
      players: [...roster.players, playerName],
    }
    updateTeam({ rosters: newRosters, rostersUpdatedAt: new Date() })
  }
  const removePlayerFromRoster = (rosterIndex: number, playerName: string) => {
    const roster = allRosters.at(rosterIndex)
    if (!roster || !roster.players.includes(playerName)) return
    const newRosters = [...allRosters]
    newRosters[rosterIndex] = {
      ...roster,
      players: roster.players.filter(name => name !== playerName),
    }
    updateTeam({ rosters: newRosters, rostersUpdatedAt: new Date() })
  }
  const openRosterForm = (index?: number) => {
    setEditingRosterIndex(index)
    setIsRosterFormModalOpen(true)
  }
  const saveRoster = ({
    roster,
    index,
  }: {
    roster: RosterTeam
    index?: number
  }) => {
    const newRosters = [...allRosters]
    if (index === undefined) {
      newRosters.push(roster)
    } else {
      newRosters[index] = roster
    }
    updateTeam({ rosters: newRosters, rostersUpdatedAt: new Date() })
  }
  const deleteRoster = (index: number) => {
    const newRosters = [...allRosters]
    newRosters.splice(index, 1)
    updateTeam({ rosters: newRosters, rostersUpdatedAt: new Date() })
  }
  return (
    <>
      <div className='flex'>
        <h2 className='grow'>rosters</h2>
        <div className='flex space-x-6'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            title='add roster'
            onClick={() => {
              openRosterForm()
            }}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
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
          {rosters.map(roster => {
            const rosterIndex = allRosters.indexOf(roster)
            return (
              <Disclosure
                key={`${roster.name}-${rosterIndex}`}
                as='div'
                className='py-2 first:pt-0'
              >
                {({ open }) => (
                  <>
                    <div className='flex items-center gap-2'>
                      <DisclosureButton className='flex grow items-center gap-2 text-left'>
                        <span className='grow'>{roster.name}</span>
                        {roster.isOpponent && (
                          <span className='text-xs opacity-50'>opponent</span>
                        )}
                        <ChevronDownIcon
                          className={classNames(
                            'h-5 w-5 transition-transform',
                            open && 'rotate-180'
                          )}
                        />
                      </DisclosureButton>
                      <button
                        className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
                        type='button'
                        onClick={() => {
                          openRosterForm(rosterIndex)
                        }}
                      >
                        <PencilSquareIcon className='h-6 w-6' />
                      </button>
                      <button
                        className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
                        type='button'
                        title='add player'
                        onClick={() => {
                          setRosterToAddPlayerIndex(rosterIndex)
                          setIsAddPlayerCommandPaletteOpen(true)
                        }}
                      >
                        <PlusIcon className='h-6 w-6' />
                      </button>
                      <button
                        className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
                        type='button'
                        onClick={() => {
                          setRosterToDeleteIndex(rosterIndex)
                          setIsDeleteRosterModalOpen(true)
                        }}
                      >
                        <TrashIcon className='h-6 w-6' />
                      </button>
                    </div>
                    <DisclosurePanel className='pt-1'>
                      <RosterDisplay
                        roster={roster}
                        playerList={playerList}
                        removePlayer={playerName => {
                          removePlayerFromRoster(rosterIndex, playerName)
                        }}
                      />
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
            )
          })}
        </div>
      )}
      <RosterFormModal
        isOpen={isRosterFormModalOpen}
        setIsOpen={setIsRosterFormModalOpen}
        roster={
          editingRosterIndex === undefined
            ? undefined
            : allRosters[editingRosterIndex]
        }
        rosterIndex={editingRosterIndex}
        rosters={allRosters}
        saveRoster={saveRoster}
      />
      <ConfirmModal
        title='delete roster'
        isOpen={isDeleteRosterModalOpen}
        setIsOpen={setIsDeleteRosterModalOpen}
        action={() => {
          if (rosterToDeleteIndex === null) return
          deleteRoster(rosterToDeleteIndex)
          setRosterToDeleteIndex(null)
        }}
      >
        <p>
          {rosterToDeleteIndex === null
            ? 'delete roster?'
            : `delete ${allRosters[rosterToDeleteIndex]?.name ?? 'roster'}?`}
        </p>
      </ConfirmModal>
      {rosterToAddPlayerTo !== undefined && (
        <CommandPalette
          toggleIsOpenHotKey={'A'}
          placeholder='add player'
          filterGroups={[
            {
              id: 'position',
              label: 'position',
              options: positions,
              selected: selectedPositions,
              onToggle: position => {
                setSelectedPositions(prev => toggleFilterValue(prev, position))
              },
            },
            {
              id: 'team',
              label: 'team',
              options: playerTeams,
              selected: selectedTeams,
              onToggle: playerTeam => {
                setSelectedTeams(prev =>
                  prev.includes(playerTeam) ? [] : [playerTeam]
                )
              },
            },
            {
              id: 'watchlist',
              options: watchlist.length > 0 ? ['watchlist'] : [],
              selected: watchlistOnly ? ['watchlist'] : [],
              onToggle: () => {
                setWatchlistOnly(prev => !prev)
              },
            },
          ]}
          commands={filteredPlayerList.map((player, index) => {
            const disabledReason = rosterToAddPlayerTo.players.includes(
              player.name
            )
              ? 'already on roster'
              : undefined
            return {
              id: `roster-player-${index}`,
              title: `add ${player.name} - ${player.position.join(', ')}`,
              subtitle: disabledReason,
              disabled: disabledReason !== undefined,
              action: () => {
                addPlayerToRoster(player.name)
              },
            }
          })}
          isOpen={isAddPlayerCommandPaletteOpen}
          setIsOpen={setIsAddPlayerCommandPaletteOpen}
        />
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
