import { useLocalStorage } from '@uidotdev/usehooks'

import type { Player } from '@/lib/use-players'

const DEFAULT_DRAFT_TEAMS = 12
const DEFAULT_DRAFT_PICK = 1

export type Draft = {
  players: Player[]
  teams: number
  pick: number
}

export type Team = {
  name: string
  players: Player[]
  draft?: Draft
}

const defaultTeams: Team[] = []

export function useTeams() {
  const [teams, setTeams] = useLocalStorage<Team[]>('sz-teams', defaultTeams)
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
      team.players.splice(playerIndex, 1)
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
    deletePlayerByIndex,
    addPlayerToDraft,
    deletePlayerFromDraftByIndex,
    overwriteDraft,
  }
}
