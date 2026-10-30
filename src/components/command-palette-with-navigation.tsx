import { useNavigate } from '@tanstack/react-router'

import DefaultCommandPalette from '@/components/command-palette'
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

export default function CommandPalette({ commands }: { commands: Command[] }) {
  const navigate = useNavigate()
  const routes = getRoutes(routeTree)
  const navigateRoutesCommands = routes.map(route => ({
    id: `go-${route === '/' ? 'home' : route}`,
    title: `go ${route === '/' ? 'home' : route.replaceAll('/', '')}`,
    action: () => {
      navigate({
        to: route,
      })
    },
  }))
  const defaultCommands = [...navigateRoutesCommands]

  return <DefaultCommandPalette commands={[...commands, ...defaultCommands]} />
}
