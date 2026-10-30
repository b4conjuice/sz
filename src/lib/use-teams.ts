import { useLocalStorage } from '@uidotdev/usehooks'

import type { Player } from '@/lib/use-players'

export type Team = {
  name: string
  players: Player[]
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
  return {
    teams,
    overwriteTeams,
    saveTeam,
    deleteTeamByIndex,
    addPlayerToTeam,
    deletePlayerByIndex,
  }
}
