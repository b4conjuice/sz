import { createFileRoute, useNavigate } from '@tanstack/react-router'

import Menu from '@/components/menu'
import { usePlayers } from '@/lib/use-players'
import { getTeams, useTeams } from '@/lib/use-teams'
import type { Team } from '@/lib/use-teams'
import CoreCommandPalette from '@/components/command-palette'
import { Depth, Draft, Roster } from '@/components/team'
import { DEFAULT_TITLE } from '@/routes/__root'
import ImportExportModal from '@/components/import-export-modal'

export const Route = createFileRoute('/teams/$teamIndex')({
  component: RouteComponent,
  ssr: false,
  loader: ({ params }) => {
    const teams = getTeams()
    const team = teams[Number(params.teamIndex)]
    return { team }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.team
          ? `${loaderData.team.name} - ${DEFAULT_TITLE}`
          : `teams - ${DEFAULT_TITLE}`,
      },
    ],
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { teamIndex: teamIndexParam } = Route.useParams()
  const teamIndex = Number(teamIndexParam)
  const {
    teams,
    saveTeam,
    addPlayerToTeam,
    deletePlayerByIndex,
    addPlayerToDraft,
    toggleCompleteDraft,
    overwriteDraft,
  } = useTeams()
  const { players: playerList, savePlayer } = usePlayers()
  const team = teams.at(teamIndex)
  if (!team) {
    return <p>team does not exist</p>
  }

  const { name, players, draft } = team
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2>{name}</h2>
        <h2>depth</h2>
        <Depth team={team} />
        <Roster
          team={team}
          teamIndex={teamIndex}
          playerList={playerList}
          addPlayerToTeam={addPlayerToTeam}
          savePlayer={savePlayer}
          saveTeam={newTeam => {
            saveTeam({
              team: newTeam,
              index: teamIndex,
            })
          }}
        />
        <Draft
          draft={draft}
          teamIndex={teamIndex}
          addPlayerToDraft={addPlayerToDraft}
          toggleCompleteDraft={toggleCompleteDraft}
          overwriteDraft={overwriteDraft}
          playerList={playerList}
        />
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu
            navigationCommands={players.map(player => ({
              id: `go-${player.name}`,
              title: `go ${player.name}`,
              action: () => {
                navigate({
                  to: '/players/$playerIndex',
                  params: {
                    playerIndex: String(
                      playerList.findIndex(p => p.name === player.name)
                    ),
                  },
                })
              },
            }))}
          />
        </div>
        <div className='flex space-x-6'>
          <ImportExportModal
            object={team}
            setObject={(newTeam: Team) => {
              saveTeam({
                index: teamIndex,
                team: newTeam,
              })
            }}
          />
        </div>
      </footer>
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
    </>
  )
}
