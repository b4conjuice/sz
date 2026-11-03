import { createFileRoute } from '@tanstack/react-router'

import Menu from '@/components/menu'
import { usePlayers } from '@/lib/use-players'

export const Route = createFileRoute('/players/$playerIndex')({
  component: RouteComponent,
})

function RouteComponent() {
  const { playerIndex: playerIndexParam } = Route.useParams()
  const teamIndex = Number(playerIndexParam)
  const { players } = usePlayers()
  const player = players[teamIndex]
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2>{player.name}</h2>
      </main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu />
        </div>
        <div className='flex space-x-6'>
          <button
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            type='button'
            onClick={() => {
              // setIsAddPlayerModalOpen(true)
            }}
          >
            {/* <PlusIcon className='h-6 w-6' /> */}
          </button>
        </div>
      </footer>
    </>
  )
}
