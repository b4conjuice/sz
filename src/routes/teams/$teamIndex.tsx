import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpTrayIcon,
  PencilSquareIcon,
  TableCellsIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid'

import Menu from '@/components/menu'
import ImportExport from '@/components/import-export'
import { usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'
import { getTeams, useTeams } from '@/lib/use-teams'
import type {
  Draft as DraftType,
  Slot,
  Team,
  Transaction,
} from '@/lib/use-teams'
import { Depth, Draft, Roster, TransactionHistory } from '@/components/team'
import { DEFAULT_TITLE } from '@/routes/__root'

const TABS = ['default', 'history', 'draft', 'import-export'] as const
type Tab = (typeof TABS)[number]

const isTab = (value: unknown): value is Tab => TABS.includes(value as Tab)

export const Route = createFileRoute('/teams/$teamIndex')({
  component: RouteComponent,
  ssr: false,
  validateSearch: (search: Record<string, string>): { tab?: Tab } => {
    return {
      tab: isTab(search.tab) ? search.tab : undefined,
    }
  },
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
  const { tab: tabParam } = Route.useSearch()
  const tab = tabParam ?? 'default'
  const navigate = Route.useNavigate()
  const setTab = (newTab: Tab) => {
    navigate({
      search: { tab: newTab === 'default' ? undefined : newTab },
    })
  }
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
  const updateTeam = (updates: Partial<Team>) => {
    saveTeam({
      index: teamIndex,
      team: { ...team, ...updates },
    })
  }
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2>{name}</h2>
        {tab === 'draft' ? (
          <>
            <Depth players={draft?.players ?? []} />
            <Draft
              draft={draft}
              teamIndex={teamIndex}
              addPlayerToDraft={addPlayerToDraft}
              toggleCompleteDraft={toggleCompleteDraft}
              overwriteDraft={overwriteDraft}
              playerList={playerList}
            />
          </>
        ) : tab === 'history' ? (
          <TransactionHistory transactions={team.transactions} />
        ) : tab === 'import-export' ? (
          <>
            <section className='flex flex-col gap-3'>
              <h3>team</h3>
              <ImportExport
                object={team}
                setObject={(newTeam: Team) => {
                  updateTeam(newTeam)
                }}
              />
            </section>
            <section className='flex flex-col gap-3'>
              <h3>players</h3>
              <ImportExport
                object={players}
                setObject={(newPlayers: Player[]) => {
                  updateTeam({ players: newPlayers })
                }}
              />
            </section>
            <section className='flex flex-col gap-3'>
              <h3>slots</h3>
              <ImportExport
                object={team.slots}
                setObject={(newSlots: Slot[]) => {
                  updateTeam({ slots: newSlots })
                }}
              />
            </section>
            <section className='flex flex-col gap-3'>
              <h3>draft</h3>
              <ImportExport
                object={draft}
                setObject={(newDraft: DraftType | undefined) => {
                  updateTeam({ draft: newDraft })
                }}
              />
            </section>
            <section className='flex flex-col gap-3'>
              <h3>transactions</h3>
              <ImportExport
                object={team.transactions}
                setObject={(newTransactions: Transaction[] | undefined) => {
                  updateTeam({ transactions: newTransactions })
                }}
              />
            </section>
          </>
        ) : (
          <>
            <Depth players={players} slots={team.slots} />
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
            navigationCommands={[
              ...TABS.filter(tabOption => tabOption !== tab).map(tabOption => ({
                id: `switch-tab-team-${tabOption}`,
                title: `switch to ${tabOption === 'default' ? 'roster' : tabOption} tab `,
                action: () => {
                  setTab(tabOption)
                },
              })),
              ...players.map(player => ({
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
              })),
            ]}
          />
        </div>
        <div className='flex space-x-6'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setTab('import-export')
            }}
            disabled={tab === 'import-export'}
          >
            <ArrowUpTrayIcon className='h-6 w-6' />
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setTab('draft')
            }}
            disabled={tab === 'draft'}
          >
            <TableCellsIcon className='h-6 w-6' />
          </button>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:text-cb-light-blue disabled:pointer-events-none'
            type='button'
            onClick={() => {
              setTab('history')
            }}
            disabled={tab === 'history'}
          >
            <PencilSquareIcon className='h-6 w-6' />
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
