import { useState } from 'react'
import {
  ArrowDownOnSquareIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  LockOpenIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/20/solid'

import CommandPalette from '@/components/command-palette'
import ConfirmModal from '@/components/confirm-modal'
import Modal from '@/components/modal'
import type { Player } from '@/lib/use-players'
import type { Draft as DraftType } from '@/lib/use-teams'

function getPick({
  round,
  teams,
  pick,
  thirdRoundReversal = false,
}: {
  round: number
  teams: number
  pick: number
  thirdRoundReversal?: boolean
}) {
  const draftRound = round + 1
  const teamIndex = pick - 1

  const pickInRound =
    thirdRoundReversal && draftRound >= 3
      ? draftRound === 3
        ? teams - 1 - teamIndex
        : draftRound % 2 === 0
          ? teamIndex
          : teams - 1 - teamIndex
      : draftRound % 2 === 1
        ? teamIndex
        : teams - 1 - teamIndex

  return (draftRound - 1) * teams + pickInRound + 1
}

export function Draft({
  draft,
  teamIndex,
  addPlayerToDraft,
  toggleCompleteDraft,
  overwriteDraft,
  playerList,
}: {
  draft?: DraftType
  teamIndex: number
  addPlayerToDraft: (args: { teamIndex: number; player: Player }) => void
  toggleCompleteDraft: (teamIndex: number) => void
  overwriteDraft: (args: {
    teamIndex: number
    draft: DraftType | undefined
  }) => void
  playerList: Player[]
}) {
  const [isDraftPlayerCommandPaletteOpen, setIsDraftPlayerCommandPaletteOpen] =
    useState(false)
  const [isDraftSettingsModalOpen, setIsDraftSettingsModalOpen] =
    useState(false)
  const [isConfirmClearDraftModalOpen, setIsConfirmClearDraftModalOpen] =
    useState(false)
  const [newDraft, setNewDraft] = useState(draft)
  return (
    <>
      <div className='flex'>
        <h2 className='grow'>draft</h2>
        <div className='flex space-x-6'>
          <button
            className='text-red-700 hover:text-red-700/75 disabled:pointer-events-none disabled:opacity-25'
            onClick={() => {
              setIsConfirmClearDraftModalOpen(true)
            }}
            disabled={!draft || draft.complete}
          >
            <TrashIcon className='h-6 w-6' />
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            onClick={() => {
              toggleCompleteDraft(teamIndex)
            }}
            disabled={!draft}
          >
            {draft?.complete ? (
              <LockClosedIcon className='h-6 w-6' />
            ) : (
              <LockOpenIcon className='h-6 w-6' />
            )}
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            onClick={() => {
              setNewDraft(draft)
              setIsDraftSettingsModalOpen(true)
            }}
            disabled={!draft || draft.complete}
          >
            <Cog6ToothIcon className='h-6 w-6' />
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              setIsDraftPlayerCommandPaletteOpen(true)
            }}
            disabled={draft?.complete}
          >
            <PlusIcon className='h-6 w-6' />
          </button>
        </div>
      </div>
      {draft && (
        <ul className='divide-cb-dusty-blue divide-y'>
          {draft.players.map((player, round) => (
            <li key={round} className='flex py-4 first:pt-0 last:pb-0'>
              <span className='flex grow gap-2'>
                <span>
                  {getPick({
                    round,
                    teams: draft.teams,
                    pick: draft.pick,
                  })}
                </span>
                <span>{player.name}</span>
                <span>{player.position.join(', ')}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <Modal
        title='draft settings'
        isOpen={isDraftSettingsModalOpen}
        setIsOpen={setIsDraftSettingsModalOpen}
      >
        <form
          className='space-y-3'
          onSubmit={e => {
            e.preventDefault()
            if (!newDraft || !draft) {
              return
            }
            overwriteDraft({
              teamIndex,
              draft: {
                ...draft,
                teams: newDraft.teams,
                pick: newDraft.pick,
              },
            })
          }}
        >
          <label htmlFor='teams'>
            teams
            <input
              className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
              type='number'
              autoFocus
              value={newDraft?.teams}
              onChange={e => {
                setNewDraft(prev => {
                  if (!prev) {
                    return prev
                  }
                  return {
                    ...prev,
                    teams: Number(e.target.value),
                  }
                })
              }}
            />
          </label>
          <label htmlFor='pick'>
            pick
            <input
              className='bg-cb-blue w-full disabled:pointer-events-none disabled:opacity-25'
              type='number'
              value={newDraft?.pick}
              onChange={e => {
                setNewDraft(prev => {
                  if (!prev) {
                    return prev
                  }
                  return {
                    ...prev,
                    pick: Number(e.target.value),
                  }
                })
              }}
            />
          </label>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 flex items-center gap-2 disabled:pointer-events-none disabled:opacity-25'
            type='submit'
            disabled={
              newDraft?.teams === draft?.teams && newDraft?.pick === draft?.pick
            }
          >
            <ArrowDownOnSquareIcon className='h-6 w-6' /> save
          </button>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={isConfirmClearDraftModalOpen}
        setIsOpen={setIsConfirmClearDraftModalOpen}
        action={() => {
          overwriteDraft({ teamIndex, draft: undefined })
        }}
      >
        clear draft?
      </ConfirmModal>
      {!draft?.complete && (
        <CommandPalette
          toggleIsOpenHotKey={'D'}
          placeholder='draft player'
          commands={playerList.map((player, index) => ({
            id: `draft-player-${index}`,
            title: `draft ${player.name} - ${player.position.join(', ')}`,
            action: () => {
              addPlayerToDraft({ teamIndex, player })
            },
          }))}
          isOpen={isDraftPlayerCommandPaletteOpen}
          setIsOpen={setIsDraftPlayerCommandPaletteOpen}
        />
      )}
    </>
  )
}
