import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  PencilSquareIcon,
  TableCellsIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid'

import Menu from '@/components/menu'
import { usePlayers } from '@/lib/use-players'
import { getTeams, useTeams } from '@/lib/use-teams'
import type { Team } from '@/lib/use-teams'
import { Depth, Draft, Roster, TransactionHistory } from '@/components/team'
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

const TABS = ['default', 'history', 'draft'] as const
type Tab = (typeof TABS)[number]

function RouteComponent() {
  // const initialTab = searchParams.get('tab') as Tab
  const initialTab = 'default' // TODO:
  const [tab, setTab] = useState<Tab | null>(initialTab ?? 'default')
  const navigate = useNavigate()
  const { teamIndex: teamIndexParam } = Route.useParams()
  const teamIndex = Number(teamIndexParam)
  const {
    teams,
    saveTeam,
    addPlayerToTeam,
    replacePlayerOnTeam,
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
        {tab === 'draft' ? (
          <Draft
            draft={draft}
            teamIndex={teamIndex}
            addPlayerToDraft={addPlayerToDraft}
            toggleCompleteDraft={toggleCompleteDraft}
            overwriteDraft={overwriteDraft}
            playerList={playerList}
          />
        ) : tab === 'history' ? (
          <TransactionHistory transactions={team.transactions} />
        ) : (
          <>
            <Depth team={team} />
            <Roster
              team={team}
              teamIndex={teamIndex}
              playerList={playerList}
              addPlayerToTeam={addPlayerToTeam}
              replacePlayerOnTeam={replacePlayerOnTeam}
              deletePlayerByIndex={deletePlayerByIndex}
              savePlayer={savePlayer}
              saveTeam={newTeam => {
                saveTeam({
                  team: newTeam,
                  index: teamIndex,
                })
              }}
            />
          </>
        )}
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
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setTab('draft')
            }}
            disabled={tab === 'draft'}
          >
            <PencilSquareIcon className='h-6 w-6' />
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setTab('history')
            }}
            disabled={tab === 'history'}
          >
            <TableCellsIcon className='h-6 w-6' />
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setTab('default')
            }}
            disabled={tab === 'default'}
          >
            <UserGroupIcon className='h-6 w-6' />
          </button>
        </div>
      </footer>
    </>
  )
}
