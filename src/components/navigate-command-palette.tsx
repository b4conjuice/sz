import { useLocation, useNavigate, useRouter } from '@tanstack/react-router'

import CommandPalette from '@/components/command-palette'
import type { Command } from '@/components/command-palette'
import { routeTree } from '@/routeTree.gen'

function getRoutes(route: typeof routeTree): string[] {
  return [
    route.fullPath,
    ...Object.values(route.children ?? {})
      .map(child => child.fullPath)
      .filter(
        path => path !== '/' && path.split('/').filter(Boolean).length === 1
      ),
  ]
}

export default function NavigateCommandPalette({
  commands,
}: {
  commands?: Command[]
}) {
  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate()
  const router = useRouter()
  const routes = getRoutes(routeTree)
  const navigateRoutesCommands = routes
    .filter(route => route !== currentPath)
    .map(route => ({
      id: `go-${route === '/' ? 'home' : route}`,
      title: `go ${route === '/' ? 'home' : route.replaceAll('/', '')}`,
      action: () => {
        navigate({
          to: route,
        })
      },
    }))
  const defaultCommands = [
    ...navigateRoutesCommands,
    {
      id: 'go-back',
      title: 'go back',
      action: () => {
        router.history.back()
      },
    },
  ]

  return (
    <CommandPalette
      toggleIsOpenHotKey='N'
      placeholder='navigate to'
      commands={[...(commands ?? []), ...defaultCommands]}
    />
  )
}
