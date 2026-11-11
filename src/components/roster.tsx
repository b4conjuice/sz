import { useState } from 'react'
import classNames from 'classnames'
import {
  ArrowsUpDownIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'

import CoreCommandPalette from '@/components/command-palette'
import Modal from '@/components/modal'
import type { Player } from '@/lib/use-players'
import {
  DEFAULT_SLOTS,
  EMPTY_SLOT_PLAYER,
  NORMAL_SLOT_OPTIONS,
  createEmptySlot,
  getRosterSize,
  isIrSlot,
  recordTransactions,
  resizeSlots,
} from '@/lib/use-teams'
import type { Slot, Team as TeamType, Transaction } from '@/lib/use-teams'

export function Roster({
  team,
  teamIndex,
  playerList,
  addPlayerToTeam,
  replacePlayerOnTeam,
  deletePlayerByIndex,
  savePlayer,
  saveTeam,
}: {
  team: TeamType
  teamIndex: number
  playerList: Player[]
  addPlayerToTeam: (args: { teamIndex: number; player: Player }) => void
  replacePlayerOnTeam: (args: {
    teamIndex: number
    player: Player
    replacedPlayerName: string
  }) => void
  deletePlayerByIndex: (args: {
    teamIndex: number
    playerIndex: number
  }) => void
  savePlayer: (args: { player: Player; index?: number }) => void
  saveTeam: (team: TeamType) => void
}) {
  const [isRosterSettingsModalOpen, setIsRosterSettingsModalOpen] =
    useState(false)
  const [isAddPlayerCommandPaletteOpen, setIsAddPlayerCommandPaletteOpen] =
    useState(false)
  const [isAddNewPlayerModalOpen, setIsAddNewPlayerModalOpen] = useState(false)
  const [newPlayer, setNewPlayer] = useState<Player>({
    name: '',
    team: '',
    position: [],
  })
  const [movingSlotIndex, setMovingSlotIndex] = useState<number | null>(null)
  const [pendingPlayer, setPendingPlayer] = useState<Player | null>(null)
  const positions = [
    ...new Set([
      'PG',
      'SG',
      'SF',
      'PF',
      'C',
      ...playerList.reduce(
        (currentAllTags: string[], currentPlayer: Player) => {
          const { position } = currentPlayer
          return [...currentAllTags, ...position]
        },
        []
      ),
    ]),
  ]
  const playerTeams = [
    ...new Set(
      playerList.reduce((currentTeams: string[], currentPlayer: Player) => {
        return [...currentTeams, currentPlayer.team]
      }, [])
    ),
  ].filter(playerTeam => Boolean(playerTeam))
  const { players, draft } = team
  const slots = team.slots ?? DEFAULT_SLOTS
  const draftRosterSize = draft?.complete ? draft.players.length : null
  const sizedSlots =
    draftRosterSize === null ? slots : resizeSlots(slots, draftRosterSize)
  const normalSlots = sizedSlots.filter(slot => !isIrSlot(slot))
  const irSlots = sizedSlots.filter(isIrSlot)
  const slottedPlayerNames = new Set(sizedSlots.map(slot => slot.player))
  const benchSlots = players
    .filter(player => !slottedPlayerNames.has(player.name))
    .map(player => ({ ...createEmptySlot('B'), player: player.name }))
  const visibleSlots = [...normalSlots, ...benchSlots, ...irSlots]
  const toRealSlots = (allSlots: Slot[]) => [
    ...allSlots.slice(0, normalSlots.length),
    ...allSlots.slice(normalSlots.length + benchSlots.length),
  ]
  const rosterSize = getRosterSize(sizedSlots)
  const teamRosterSize = getRosterSize(sizedSlots)
  const irPlayerNames = new Set(
    sizedSlots.filter(isIrSlot).map(slot => slot.player)
  )
  const activePlayerCount = players.filter(
    player => !irPlayerNames.has(player.name)
  ).length
  const isRosterFull = activePlayerCount >= teamRosterSize
  const addPlayer = (player: Player) => {
    if (isRosterFull) {
      setPendingPlayer(player)
      return
    }
    addPlayerToTeam({ player, teamIndex })
  }
  const [newRosterSize, setNewRosterSize] = useState(rosterSize)
  const [newSlots, setNewSlots] = useState<Slot[]>(sizedSlots)
  const [replacePlayer, setReplacePlayer] = useState(false)
  const slotsHaveChanged =
    newSlots.length !== sizedSlots.length ||
    newSlots.some((slot, index) => {
      const originalSlot = sizedSlots.at(index)
      return (
        !originalSlot ||
        slot.label !== originalSlot.label ||
        slot.eligiblePositions.join(',') !==
          originalSlot.eligiblePositions.join(',')
      )
    })
  const movingSlot =
    movingSlotIndex === null ? undefined : visibleSlots.at(movingSlotIndex)
  const movingPlayer = movingSlot
    ? players.find(player => player.name === movingSlot.player)
    : undefined
  const isPlayerEligibleForSlot = (player: Player, slot: Slot) =>
    slot.eligiblePositions.some(position => player.position.includes(position))
  const canMoveToSlot = (targetSlot: Slot, targetIndex: number) => {
    if (
      movingSlotIndex === null ||
      !movingSlot ||
      !movingPlayer ||
      targetIndex === movingSlotIndex
    ) {
      return false
    }
    if (!isPlayerEligibleForSlot(movingPlayer, targetSlot)) {
      return false
    }
    if (
      targetSlot.player !== EMPTY_SLOT_PLAYER &&
      isIrSlot(movingSlot) &&
      !isIrSlot(targetSlot)
    ) {
      return false
    }
    return true
  }
  const movePlayer = (fromIndex: number | null, toIndex: number) => {
    if (fromIndex === null) {
      return
    }
    const fromSlot = visibleSlots.at(fromIndex)
    const toSlot = visibleSlots.at(toIndex)
    if (!fromSlot || !toSlot) {
      return
    }
    const fromPlayer = players.find(player => player.name === fromSlot.player)
    const toPlayer = players.find(player => player.name === toSlot.player)
    const canSwapBack =
      !toPlayer ||
      fromSlot.eligiblePositions.some(position =>
        toPlayer.position.includes(position)
      )
    const updatedSlots = toRealSlots(
      visibleSlots.map((slot, index) => {
        if (index === toIndex) {
          return { ...slot, player: fromSlot.player }
        }
        if (index === fromIndex) {
          return {
            ...slot,
            player: canSwapBack ? toSlot.player : EMPTY_SLOT_PLAYER,
          }
        }
        return slot
      })
    )
    const wasInIr = new Set(
      sizedSlots.filter(isIrSlot).map(slot => slot.player)
    )
    const isInIr = new Set(
      updatedSlots.filter(isIrSlot).map(slot => slot.player)
    )
    const transactions: Array<Omit<Transaction, 'date'>> = []
    for (const player of [fromPlayer, toPlayer]) {
      if (!player) {
        continue
      }
      const wasIr = wasInIr.has(player.name)
      const nowIr = isInIr.has(player.name)
      if (wasIr === nowIr) {
        continue
      }
      transactions.push({
        type: nowIr ? 'move-into-ir' : 'move-out-of-ir',
        players: [player],
      })
    }
    const newTeam = { ...team, slots: updatedSlots }
    saveTeam(
      transactions.length > 0
        ? recordTransactions(newTeam, transactions)
        : newTeam
    )
    setMovingSlotIndex(null)
  }
  const dropPlayerAndMove = (fromIndex: number | null, toIndex: number) => {
    if (fromIndex === null) {
      return
    }
    const fromSlot = visibleSlots.at(fromIndex)
    const toSlot = visibleSlots.at(toIndex)
    if (!fromSlot || !toSlot) {
      return
    }
    const fromPlayer = players.find(player => player.name === fromSlot.player)
    const droppedPlayer = players.find(player => player.name === toSlot.player)
    const transactions: Array<Omit<Transaction, 'date'>> = []
    if (fromPlayer && isIrSlot(fromSlot) && !isIrSlot(toSlot)) {
      transactions.push({ type: 'move-out-of-ir', players: [fromPlayer] })
    }
    if (droppedPlayer) {
      transactions.push({ type: 'drop', players: [droppedPlayer] })
    }
    const newTeam = {
      ...team,
      players: players.filter(player => player.name !== toSlot.player),
      slots: toRealSlots(
        visibleSlots.map((slot, index) => {
          if (index === fromIndex) {
            return { ...slot, player: EMPTY_SLOT_PLAYER }
          }
          if (index === toIndex) {
            return { ...slot, player: fromSlot.player }
          }
          return slot
        })
      ),
    }
    saveTeam(
      transactions.length > 0
        ? recordTransactions(newTeam, transactions)
        : newTeam
    )
    setMovingSlotIndex(null)
  }
  return (
    <>
      <div className='flex'>
        <h2 className='grow'>roster</h2>
        <div className='flex space-x-6'>
          <button
            className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
            onClick={() => {
              setReplacePlayer(!replacePlayer)
            }}
          >
            {replacePlayer ? (
              <XMarkIcon className='h-6 w-6' />
            ) : (
              <TrashIcon className='h-6 w-6' />
            )}
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            onClick={() => {
              setNewRosterSize(rosterSize)
              setNewSlots(sizedSlots)
              setIsRosterSettingsModalOpen(true)
            }}
          >
            <Cog6ToothIcon className='h-6 w-6' />
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              setIsAddPlayerCommandPaletteOpen(true)
            }}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
        </div>
      </div>
      <ul className='divide-cb-dusty-blue divide-y'>
        {visibleSlots.map((slot, slotIndex) => {
          const player = players.find(p => p.name === slot.player)
          const isEmpty = slot.player === EMPTY_SLOT_PLAYER
          const isEligible = player
            ? player.position.some(position =>
                slot.eligiblePositions.includes(position)
              )
            : true
          const isMovingSlot = movingSlotIndex === slotIndex
          const canMoveHere = canMoveToSlot(slot, slotIndex)
          const canReplaceHere =
            movingSlotIndex !== null &&
            movingSlot !== undefined &&
            movingPlayer !== undefined &&
            slotIndex !== movingSlotIndex &&
            isIrSlot(movingSlot) &&
            !isIrSlot(slot) &&
            !isEmpty &&
            isPlayerEligibleForSlot(movingPlayer, slot)
          return (
            <li key={slotIndex} className='flex py-4 first:pt-0'>
              <span className='w-12 shrink-0'>{slot.label}</span>
              <span className='flex grow gap-2'>
                {isEmpty ? (
                  <span className='opacity-25'>{EMPTY_SLOT_PLAYER}</span>
                ) : (
                  <>
                    <span className={classNames(!isEligible && 'text-red-700')}>
                      {slot.player}
                    </span>
                    {player && <span>{player.position.join(', ')}</span>}
                  </>
                )}
              </span>
              <span className='flex items-center space-x-6'>
                {canMoveHere && (
                  <button
                    className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
                    type='button'
                    onClick={() => {
                      movePlayer(movingSlotIndex, slotIndex)
                    }}
                  >
                    move here
                  </button>
                )}
                {canReplaceHere && (
                  <button
                    className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
                    type='button'
                    onClick={() => {
                      dropPlayerAndMove(movingSlotIndex, slotIndex)
                    }}
                  >
                    <TrashIcon className='h-6 w-6' />
                  </button>
                )}
                {movingSlotIndex === null && !isEmpty && (
                  <button
                    className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
                    onClick={() => {
                      setMovingSlotIndex(slotIndex)
                    }}
                  >
                    <ArrowsUpDownIcon className='h-6 w-6' />
                  </button>
                )}
                {isMovingSlot && (
                  <button
                    className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
                    onClick={() => {
                      setMovingSlotIndex(null)
                    }}
                  >
                    <XMarkIcon className='h-6 w-6' />
                  </button>
                )}
                {replacePlayer && !isEmpty && (
                  <button
                    className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
                    onClick={() => {
                      const newTeam = {
                        ...team,
                        players: players.filter(
                          currentPlayer => currentPlayer.name !== slot.player
                        ),
                        slots: toRealSlots(
                          visibleSlots.map((currentSlot, index) =>
                            index === slotIndex
                              ? { ...currentSlot, player: EMPTY_SLOT_PLAYER }
                              : currentSlot
                          )
                        ),
                      }
                      saveTeam(
                        player
                          ? recordTransactions(newTeam, [
                              { type: 'drop', players: [player] },
                            ])
                          : newTeam
                      )
                    }}
                  >
                    <TrashIcon className='h-6 w-6' />
                  </button>
                )}
              </span>
            </li>
          )
        })}
      </ul>
      <Modal
        title='roster settings'
        isOpen={isRosterSettingsModalOpen}
        setIsOpen={setIsRosterSettingsModalOpen}
      >
        <label htmlFor='roster-size'>
          roster size
          <input
            id='roster-size'
            className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
            type='number'
            min={1}
            value={newRosterSize}
            disabled={draftRosterSize !== null}
            onChange={e => {
              const size = Math.max(1, Number(e.target.value))
              setNewRosterSize(size)
              setNewSlots(prev => resizeSlots(prev, size))
            }}
          />
        </label>
        {draftRosterSize !== null && (
          <p className='opacity-75'>matches completed draft size</p>
        )}
        <ul className='space-y-2'>
          {newSlots.map((slot, index) =>
            isIrSlot(slot) ? (
              <li key={index} className='flex items-center gap-2'>
                <span className='w-20 shrink-0'>slot {index + 1}</span>
                <span className='grow'>IR</span>
                <button
                  className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
                  type='button'
                  onClick={() => {
                    setNewSlots(prev =>
                      prev.filter((_, slotIndex) => slotIndex !== index)
                    )
                  }}
                >
                  <TrashIcon className='h-6 w-6' />
                </button>
              </li>
            ) : (
              <li key={index} className='flex items-center gap-2'>
                <label
                  htmlFor={`slot-position-${index}`}
                  className='w-20 shrink-0'
                >
                  slot {index + 1}
                </label>
                <select
                  id={`slot-position-${index}`}
                  className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
                  value={slot.label}
                  onChange={e => {
                    const template = NORMAL_SLOT_OPTIONS.find(
                      option => option.label === e.target.value
                    )
                    if (!template) {
                      return
                    }
                    setNewSlots(prev =>
                      prev.map((currentSlot, currentIndex) =>
                        currentIndex === index
                          ? {
                              ...currentSlot,
                              label: template.label,
                              eligiblePositions: [
                                ...template.eligiblePositions,
                              ],
                            }
                          : currentSlot
                      )
                    )
                  }}
                >
                  {NORMAL_SLOT_OPTIONS.map(option => (
                    <option key={option.label} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </li>
            )
          )}
        </ul>
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          type='button'
          onClick={() => {
            setNewSlots(prev => [...prev, createEmptySlot('IR')])
          }}
        >
          add IR slot
        </button>
        <button
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          type='button'
          onClick={() => {
            saveTeam({
              ...team,
              slots: resizeSlots(newSlots, newRosterSize),
            })
            setIsRosterSettingsModalOpen(false)
          }}
          disabled={newRosterSize === rosterSize && !slotsHaveChanged}
        >
          save
        </button>
      </Modal>
      <CoreCommandPalette
        toggleIsOpenHotKey={'A'}
        placeholder='add player'
        commands={[
          {
            id: 'add-new-player',
            title: 'create new player',
            action: () => {
              setIsAddNewPlayerModalOpen(true)
            },
          },
          ...playerList.map((player, index) => ({
            id: `add-player-${index}`,
            title: `add ${player.name} - ${player.position.join(', ')}`,
            action: () => {
              addPlayer(player)
            },
          })),
        ]}
        isOpen={isAddPlayerCommandPaletteOpen}
        setIsOpen={setIsAddPlayerCommandPaletteOpen}
      />
      <CoreCommandPalette
        placeholder={
          pendingPlayer
            ? `drop a player to add ${pendingPlayer.name}`
            : 'drop player'
        }
        isOpen={pendingPlayer !== null}
        setIsOpen={isOpen => {
          if (!isOpen) {
            setPendingPlayer(null)
          }
        }}
        commands={players
          .filter(player => !irPlayerNames.has(player.name))
          .map((player, index) => ({
            id: `replace-player-${index}`,
            title: `drop ${player.name} - ${player.position.join(', ')}`,
            action: () => {
              if (!pendingPlayer) {
                return
              }
              replacePlayerOnTeam({
                teamIndex,
                player: pendingPlayer,
                replacedPlayerName: player.name,
              })
              setPendingPlayer(null)
            },
          }))}
      />
      <CoreCommandPalette
        toggleIsOpenHotKey={'R'}
        placeholder='drop player'
        commands={[
          ...players.map((player, index) => ({
            id: `drop-player-${index}`,
            title: `draft ${player.name} - ${player.position.join(', ')}`,
            action: () => {
              deletePlayerByIndex({
                teamIndex,
                playerIndex: index,
              })
            },
          })),
        ]}
      />
      <Modal
        title='create new player'
        isOpen={isAddNewPlayerModalOpen}
        setIsOpen={setIsAddNewPlayerModalOpen}
      >
        <input
          type='text'
          className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
          placeholder='name'
          value={newPlayer.name}
          onChange={e => {
            setNewPlayer(prev => ({
              ...prev,
              name: e.target.value,
            }))
          }}
        />
        <input
          type='text'
          className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
          placeholder='team'
          value={newPlayer.team}
          onChange={e => {
            setNewPlayer(prev => ({
              ...prev,
              team: e.target.value,
            }))
          }}
        />
        {playerTeams.length > 0 && (
          <select
            className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
            value={playerTeams.includes(newPlayer.team) ? newPlayer.team : ''}
            onChange={e => {
              setNewPlayer(prev => ({
                ...prev,
                team: e.target.value,
              }))
            }}
          >
            <option value=''>select team</option>
            {playerTeams.map(playerTeam => (
              <option key={playerTeam} value={playerTeam}>
                {playerTeam}
              </option>
            ))}
          </select>
        )}
        <ul className='flex gap-2 overflow-x-auto'>
          {positions.map(pos => (
            <li key={pos}>
              <button
                className={classNames(
                  'bg-cb-blue rounded-lg border p-2',
                  newPlayer.position.includes(pos)
                    ? 'border-cb-pink'
                    : 'border-cb-blue'
                )}
                type='button'
                onClick={() => {
                  const newPositionIndex = newPlayer.position.findIndex(
                    p => p === pos
                  )
                  const newPosition = [...newPlayer.position]
                  if (newPositionIndex > -1) {
                    newPosition.splice(newPositionIndex, 1)
                  } else {
                    newPosition.push(pos)
                  }
                  setNewPlayer(prev => ({
                    ...prev,
                    position: newPosition,
                  }))
                }}
              >
                {pos}
              </button>
            </li>
          ))}
        </ul>
        <div className='flex items-center gap-4'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              savePlayer({ player: newPlayer })
              addPlayer(newPlayer)
              setNewPlayer({ name: '', team: '', position: [] })
              setIsAddNewPlayerModalOpen(false)
            }}
            disabled={newPlayer.name === '' || newPlayer.team === ''}
          >
            save
          </button>
        </div>
      </Modal>
    </>
  )
}
