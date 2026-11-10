import { useLocalStorage } from '@uidotdev/usehooks'

import type { Player } from '@/lib/use-players'

const DEFAULT_DRAFT_TEAMS = 12
const DEFAULT_DRAFT_PICK = 1

export type Draft = {
  players: Player[]
  teams: number
  pick: number
  complete: boolean
}

export type Slot = {
  label: string
  eligiblePositions: string[]
  player: string
}

export type Transaction = {
  date: Date
  type: 'add' | 'add/drop' | 'drop' | 'move-into-ir' | 'move-out-of-ir'
  players: Player[]
}

type NewTransaction = Omit<Transaction, 'date'> & { date?: Date }

export type Team = {
  name: string
  players: Player[]
  draft?: Draft
  slots?: Slot[]
  transactions?: Transaction[]
}

export const EMPTY_SLOT_PLAYER = 'empty'

export const recordTransactions = (
  team: Team,
  transactions: NewTransaction[]
): Team => ({
  ...team,
  transactions: [
    ...(team.transactions ?? []),
    ...transactions.map(({ date = new Date(), ...transaction }) => ({
      ...transaction,
      date,
    })),
  ],
})

export type SlotTemplate = Omit<Slot, 'player'>

const PG_SLOT: SlotTemplate = {
  label: 'PG',
  eligiblePositions: ['PG'],
}
const SG_SLOT: SlotTemplate = {
  label: 'SG',
  eligiblePositions: ['SG'],
}
const SF_SLOT: SlotTemplate = {
  label: 'SF',
  eligiblePositions: ['SF'],
}
const PF_SLOT: SlotTemplate = {
  label: 'PF',
  eligiblePositions: ['PF'],
}
const C_SLOT: SlotTemplate = {
  label: 'C',
  eligiblePositions: ['C'],
}
const G_SLOT: SlotTemplate = {
  label: 'G',
  eligiblePositions: ['PG', 'SG'],
}
const F_SLOT: SlotTemplate = {
  label: 'F',
  eligiblePositions: ['SF', 'PF'],
}
const U_SLOT: SlotTemplate = {
  label: 'U',
  eligiblePositions: ['PG', 'SG', 'SF', 'PF', 'C'],
}
const B_SLOT: SlotTemplate = {
  label: 'B',
  eligiblePositions: ['PG', 'SG', 'SF', 'PF', 'C'],
}
const IR_SLOT: SlotTemplate = {
  label: 'IR',
  eligiblePositions: ['PG', 'SG', 'SF', 'PF', 'C'],
}

export const SLOT_OPTIONS: SlotTemplate[] = [
  PG_SLOT,
  SG_SLOT,
  SF_SLOT,
  PF_SLOT,
  C_SLOT,
  G_SLOT,
  F_SLOT,
  U_SLOT,
  B_SLOT,
  IR_SLOT,
]

export const NORMAL_SLOT_OPTIONS: SlotTemplate[] = SLOT_OPTIONS.filter(
  option => option.label !== 'IR'
)

const SLOT_ORDER: SlotTemplate[] = [
  PG_SLOT,
  SG_SLOT,
  SF_SLOT,
  PF_SLOT,
  C_SLOT,
  G_SLOT,
  F_SLOT,
  U_SLOT,
  B_SLOT,
  B_SLOT,
  B_SLOT,
  IR_SLOT,
]

const NORMAL_SLOT_ORDER: SlotTemplate[] = SLOT_ORDER.filter(
  template => template.label !== 'IR'
)

const createSlot = (template: SlotTemplate): Slot => ({
  ...template,
  player: EMPTY_SLOT_PLAYER,
})

export const createEmptySlot = (label: string): Slot => {
  const template = SLOT_OPTIONS.find(option => option.label === label) ?? U_SLOT
  return createSlot(template)
}

export const isIrSlot = (slot: Slot): boolean => slot.label === 'IR'

export const getRosterSize = (slots: Slot[]): number =>
  slots.filter(slot => !isIrSlot(slot)).length

export const DEFAULT_SLOTS: Slot[] = SLOT_ORDER.slice(0, 5).map(createSlot)

export const resizeSlots = (slots: Slot[], size: number): Slot[] => {
  const normalSlots = slots.filter(slot => !isIrSlot(slot))
  const irSlots = slots.filter(slot => isIrSlot(slot))
  const resizedNormalSlots =
    size <= normalSlots.length
      ? normalSlots.slice(0, size)
      : [
          ...normalSlots,
          ...Array.from({ length: size - normalSlots.length }, (_, index) =>
            createSlot(
              NORMAL_SLOT_ORDER.at(normalSlots.length + index) ?? U_SLOT
            )
          ),
        ]
  return [...resizedNormalSlots, ...irSlots]
}

const getEligibleSlotCount = (player: Player, slots: Slot[]): number =>
  slots.filter(
    slot =>
      !isIrSlot(slot) &&
      slot.eligiblePositions.some(position => player.position.includes(position))
  ).length

const getSlotPriority = (player: Player, slot: Slot): number => {
  if (isIrSlot(slot)) {
    return -1
  }
  const exactPositionIndex = player.position.findIndex(
    position => position === slot.label
  )
  if (exactPositionIndex > -1) {
    return exactPositionIndex
  }
  const isEligible = slot.eligiblePositions.some(position =>
    player.position.includes(position)
  )
  if (!isEligible) {
    return -1
  }
  if (slot.label === G_SLOT.label || slot.label === F_SLOT.label) {
    return 10
  }
  if (slot.label === U_SLOT.label) {
    return 20
  }
  return 30
}

export const fillSlotsWithPlayers = (
  slots: Slot[],
  players: Player[]
): Slot[] => {
  const resizedSlots = resizeSlots(slots, players.length)
  const irSlots = resizedSlots.filter(isIrSlot)
  const filledSlots: Slot[] = resizedSlots
    .filter(slot => !isIrSlot(slot))
    .map(slot => ({ ...slot, player: EMPTY_SLOT_PLAYER }))
  const sortedPlayers = [...players].sort(
    (a, b) =>
      getEligibleSlotCount(a, filledSlots) - getEligibleSlotCount(b, filledSlots)
  )
  for (const player of sortedPlayers) {
    let bestSlotIndex = -1
    let bestPriority = Infinity
    filledSlots.forEach((slot, index) => {
      if (slot.player !== EMPTY_SLOT_PLAYER) {
        return
      }
      const priority = getSlotPriority(player, slot)
      if (priority > -1 && priority < bestPriority) {
        bestPriority = priority
        bestSlotIndex = index
      }
    })
    if (bestSlotIndex === -1) {
      bestSlotIndex = filledSlots.findIndex(
        slot => slot.player === EMPTY_SLOT_PLAYER
      )
    }
    if (bestSlotIndex > -1) {
      filledSlots[bestSlotIndex] = {
        ...filledSlots[bestSlotIndex],
        player: player.name,
      }
    } else {
      filledSlots.push({ ...createSlot(B_SLOT), player: player.name })
    }
  }
  return [...filledSlots, ...irSlots]
}

export const fillEmptySlotsWithPlayers = (
  slots: Slot[],
  players: Player[]
): Slot[] => {
  const slottedPlayerNames = new Set(slots.map(slot => slot.player))
  const unassignedPlayers = players.filter(
    player => !slottedPlayerNames.has(player.name)
  )
  const normalSlots = slots
    .filter(slot => !isIrSlot(slot))
    .map(slot => ({ ...slot }))
  const irSlots = slots
    .filter(slot => isIrSlot(slot))
    .map(slot => ({ ...slot }))
  for (const player of unassignedPlayers) {
    const emptySlotIndex = normalSlots.findIndex(
      slot =>
        slot.player === EMPTY_SLOT_PLAYER &&
        slot.eligiblePositions.some(position =>
          player.position.includes(position)
        )
    )
    if (emptySlotIndex > -1) {
      normalSlots[emptySlotIndex] = {
        ...normalSlots[emptySlotIndex],
        player: player.name,
      }
    } else {
      normalSlots.push({
        ...createSlot(NORMAL_SLOT_ORDER.at(normalSlots.length) ?? B_SLOT),
        player: player.name,
      })
    }
  }
  return [...normalSlots, ...irSlots]
}

export const replacePlayerInSlots = (
  slots: Slot[],
  player: Player,
  replacedPlayerName: string
): Slot[] => {
  const replacedSlotIndex = slots.findIndex(
    slot => slot.player === replacedPlayerName
  )
  const replacedSlot =
    replacedSlotIndex === -1 ? undefined : slots[replacedSlotIndex]
  const isEligible =
    replacedSlot !== undefined &&
    replacedSlot.eligiblePositions.some(position =>
      player.position.includes(position)
    )
  if (replacedSlot !== undefined && isEligible) {
    return slots.map((slot, index) =>
      index === replacedSlotIndex ? { ...slot, player: player.name } : slot
    )
  }
  const slotsWithoutReplacedPlayer = slots.map(slot =>
    slot.player === replacedPlayerName
      ? { ...slot, player: EMPTY_SLOT_PLAYER }
      : slot
  )
  return [
    ...slotsWithoutReplacedPlayer,
    { ...createSlot(B_SLOT), player: player.name },
  ]
}

const defaultTeams: Team[] = []

const TEAMS_LOCAL_STORAGE_KEY = 'sz-teams'

export function getTeams(): Team[] {
  if (typeof window === 'undefined') {
    return defaultTeams
  }
  const stored = window.localStorage.getItem(TEAMS_LOCAL_STORAGE_KEY)
  if (!stored) {
    return defaultTeams
  }
  try {
    return JSON.parse(stored) as Team[]
  } catch {
    return defaultTeams
  }
}

export function useTeams() {
  const [teams, setTeams] = useLocalStorage<Team[]>(
    TEAMS_LOCAL_STORAGE_KEY,
    defaultTeams
  )
  const overwriteTeams = (newTeams: Team[]) => {
    setTeams(newTeams)
  }
  const saveTeam = ({ team, index }: { team: Team; index?: number }) => {
    setTeams(prev => {
      if (index === -1 || index === undefined) {
        return [...prev, team]
      } else {
        const newTeams = [...prev]
        newTeams[index] = team
        return newTeams
      }
    })
  }
  const deleteTeamByIndex = (index: number) => {
    setTeams(prev => {
      const newTeams = [...prev]
      newTeams.splice(index, 1)
      return newTeams
    })
  }
  const addPlayerToTeam = ({
    teamIndex,
    player,
  }: {
    teamIndex: number
    player: Player
  }) => {
    setTeams(prev => {
      const newTeams = [...prev]
      const team = newTeams[teamIndex]
      team.players.push(player)
      team.slots = fillEmptySlotsWithPlayers(
        team.slots ?? DEFAULT_SLOTS,
        team.players
      )
      newTeams[teamIndex] = recordTransactions(team, [
        { type: 'add', players: [player] },
      ])

      return newTeams
    })
  }
  const replacePlayerOnTeam = ({
    teamIndex,
    player,
    replacedPlayerName,
  }: {
    teamIndex: number
    player: Player
    replacedPlayerName: string
  }) => {
    setTeams(prev => {
      const newTeams = [...prev]
      const team = newTeams[teamIndex]
      const replacedPlayer = team.players.find(
        currentPlayer => currentPlayer.name === replacedPlayerName
      )
      team.players = team.players
        .filter(currentPlayer => currentPlayer.name !== replacedPlayerName)
        .concat(player)
      team.slots = replacePlayerInSlots(
        team.slots ?? DEFAULT_SLOTS,
        player,
        replacedPlayerName
      )
      newTeams[teamIndex] = recordTransactions(team, [
        replacedPlayer
          ? { type: 'add/drop', players: [player, replacedPlayer] }
          : { type: 'add', players: [player] },
      ])
      return newTeams
    })
  }
  const deletePlayerByIndex = ({
    teamIndex,
    playerIndex,
  }: {
    teamIndex: number
    playerIndex: number
  }) => {
    setTeams(prev => {
      const newTeams = [...prev]
      const team = newTeams[teamIndex]
      const player = team.players.at(playerIndex)
      team.players.splice(playerIndex, 1)
      if (player && team.slots) {
        team.slots = team.slots.map(slot =>
          slot.player === player.name
            ? { ...slot, player: EMPTY_SLOT_PLAYER }
            : slot
        )
      }
      if (player) {
        newTeams[teamIndex] = recordTransactions(team, [
          { type: 'drop', players: [player] },
        ])
      }
      return newTeams
    })
  }
  const addPlayerToDraft = ({
    teamIndex,
    player,
  }: {
    teamIndex: number
    player: Player
  }) => {
    setTeams(prev => {
      const newTeams = [...prev]
      const team = newTeams[teamIndex]
      if (team.draft) {
        team.draft.players.push(player)
      } else {
        team.draft = {
          players: [player],
          teams: DEFAULT_DRAFT_TEAMS,
          pick: DEFAULT_DRAFT_PICK,
          complete: false,
        }
      }

      return newTeams
    })
  }
  const deletePlayerFromDraftByIndex = ({
    teamIndex,
    playerIndex,
  }: {
    teamIndex: number
    playerIndex: number
  }) => {
    setTeams(prev => {
      const newTeams = [...prev]
      const team = newTeams[teamIndex]
      if (team.draft) {
        team.draft.players.splice(playerIndex, 1)
      } else {
        console.error('team has no draft')
      }
      return newTeams
    })
  }
  const toggleCompleteDraft = (teamIndex: number) => {
    setTeams(prev => {
      const newTeams = [...prev]
      const team = newTeams[teamIndex]
      if (team.draft) {
        team.draft.complete = !team.draft.complete
        if (team.draft.complete) {
          team.players = [...team.draft.players]
          team.slots = fillSlotsWithPlayers(
            team.slots ?? DEFAULT_SLOTS,
            team.draft.players
          )
        }
      } else {
        console.error('team has no draft')
      }
      return newTeams
    })
  }
  const overwriteDraft = ({
    teamIndex,
    draft,
  }: {
    teamIndex: number
    draft: Draft | undefined
  }) => {
    setTeams(prev => {
      const newTeams = [...prev]
      newTeams[teamIndex].draft = draft
      return newTeams
    })
  }
  return {
    teams,
    overwriteTeams,
    saveTeam,
    deleteTeamByIndex,
    addPlayerToTeam,
    replacePlayerOnTeam,
    deletePlayerByIndex,
    addPlayerToDraft,
    deletePlayerFromDraftByIndex,
    toggleCompleteDraft,
    overwriteDraft,
  }
}
