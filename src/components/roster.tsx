import { useState } from 'react'
import classNames from 'classnames'
import {
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'

import {
  DEFAULT_SLOTS,
  EMPTY_SLOT_PLAYER,
  NORMAL_SLOT_OPTIONS,
  createEmptySlot,
  fillEmptySlotsWithPlayers,
  getRosterSize,
  isIrSlot,
  resizeSlots,
} from '@/lib/use-teams'
import type { Slot, Team as TeamType } from '@/lib/use-teams'
import Modal from '@/components/modal'

export function Roster({
  team,
  saveTeam,
}: {
  team: TeamType
  saveTeam: (team: TeamType) => void
}) {
  const [isRosterSettingsModalOpen, setIsRosterSettingsModalOpen] =
    useState(false)
  const [movingSlotIndex, setMovingSlotIndex] = useState<number | null>(null)
  const { players, draft } = team
  const slots = team.slots ?? DEFAULT_SLOTS
  const draftRosterSize = draft?.complete ? draft.players.length : null
  const sizedSlots =
    draftRosterSize === null ? slots : resizeSlots(slots, draftRosterSize)
  const effectiveSlots = fillEmptySlotsWithPlayers(sizedSlots, players)
  const rosterSize = getRosterSize(effectiveSlots)
  const [newRosterSize, setNewRosterSize] = useState(rosterSize)
  const [newSlots, setNewSlots] = useState<Slot[]>(effectiveSlots)
  const [replacePlayer, setReplacePlayer] = useState(false)
  const slotsHaveChanged =
    newSlots.length !== effectiveSlots.length ||
    newSlots.some((slot, index) => {
      const originalSlot = effectiveSlots.at(index)
      return (
        !originalSlot ||
        slot.label !== originalSlot.label ||
        slot.eligiblePositions.join(',') !==
          originalSlot.eligiblePositions.join(',')
      )
    })
  const movingSlot =
    movingSlotIndex === null ? undefined : effectiveSlots.at(movingSlotIndex)
  const movingPlayer = movingSlot
    ? players.find(player => player.name === movingSlot.player)
    : undefined
  const canMoveToSlot = (targetSlot: Slot, targetIndex: number) => {
    if (
      movingSlotIndex === null ||
      !movingSlot ||
      !movingPlayer ||
      targetIndex === movingSlotIndex
    ) {
      return false
    }
    const isTargetEligible = targetSlot.eligiblePositions.some(position =>
      movingPlayer.position.includes(position)
    )
    if (!isTargetEligible) {
      return false
    }
    if (targetSlot.player === EMPTY_SLOT_PLAYER) {
      return true
    }
    const targetPlayer = players.find(
      player => player.name === targetSlot.player
    )
    return targetPlayer
      ? movingSlot.eligiblePositions.some(position =>
          targetPlayer.position.includes(position)
        )
      : false
  }
  const movePlayer = (fromIndex: number | null, toIndex: number) => {
    if (fromIndex === null) {
      return
    }
    const fromSlot = effectiveSlots.at(fromIndex)
    const toSlot = effectiveSlots.at(toIndex)
    if (!fromSlot || !toSlot) {
      return
    }
    saveTeam({
      ...team,
      slots: effectiveSlots.map((slot, index) => {
        if (index === fromIndex) {
          return { ...slot, player: toSlot.player }
        }
        if (index === toIndex) {
          return { ...slot, player: fromSlot.player }
        }
        return slot
      }),
    })
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
              setNewSlots(effectiveSlots)
              setIsRosterSettingsModalOpen(true)
            }}
          >
            <Cog6ToothIcon className='h-6 w-6' />
          </button>
        </div>
      </div>
      <ul className='divide-cb-dusty-blue divide-y'>
        {effectiveSlots.map((slot, slotIndex) => {
          const player = players.find(p => p.name === slot.player)
          const isEmpty = slot.player === EMPTY_SLOT_PLAYER
          const isEligible = player
            ? player.position.some(position =>
                slot.eligiblePositions.includes(position)
              )
            : true
          const isMovingSlot = movingSlotIndex === slotIndex
          const canMoveHere = canMoveToSlot(slot, slotIndex)
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
                {movingSlotIndex === null && !isEmpty && (
                  <button
                    className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
                    onClick={() => {
                      setMovingSlotIndex(slotIndex)
                    }}
                  >
                    <ArrowsRightLeftIcon className='h-6 w-6' />
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
                      saveTeam({
                        ...team,
                        players: players.filter(
                          currentPlayer => currentPlayer.name !== slot.player
                        ),
                        slots: effectiveSlots.map((currentSlot, index) =>
                          index === slotIndex
                            ? { ...currentSlot, player: EMPTY_SLOT_PLAYER }
                            : currentSlot
                        ),
                      })
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
    </>
  )
}
