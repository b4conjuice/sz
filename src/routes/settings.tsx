import { createFileRoute } from '@tanstack/react-router'

import Menu from '@/components/menu'
import ImportExport from '@/components/import-export'
import { useTeams } from '@/lib/use-teams'
import type { Team } from '@/lib/use-teams'
import { usePlayers } from '@/lib/use-players'
import type { Player } from '@/lib/use-players'
import { DEFAULT_TITLE } from '@/routes/__root'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: `settings - ${DEFAULT_TITLE}` }],
  }),
})

function RouteComponent() {
  const { teams, overwriteTeams } = useTeams()
  const { players, overwritePlayers } = usePlayers()
  return (
    <>
      <main className='flex grow flex-col gap-4 p-2'>
        <h2>teams</h2>
        <ImportExport
          object={teams}
          setObject={(newTeams: Team[]) => {
            overwriteTeams(newTeams)
          }}
        />
        <h2>players</h2>
        <ImportExport
          object={players}
          setObject={(newPlayers: Player[]) => {
            overwritePlayers(newPlayers)
          }}
        />
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu />
        </div>
        <div className='flex space-x-6'></div>
      </footer>
    </>
  )
}
