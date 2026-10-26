import { createFileRoute, Link, useLocation } from '@tanstack/react-router'

import { nav } from '@/lib/config'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { pathname } = useLocation()
  return (
    <main className='flex grow flex-col p-4'>
      <div className='flex grow flex-col items-center justify-center gap-4'>
        <h1 className='font-bold'>sz</h1>
        <nav>
          <ul className='flex flex-col items-center space-y-4'>
            {nav.map(({ text, href, disabled }) =>
              href === '/' ? null : (
                <li key={href}>
                  {disabled ? (
                    <span className='opacity-50'>{text}</span>
                  ) : href === pathname ? (
                    <span>{text}</span>
                  ) : (
                    <Link className='text-cb-pink hover:underline' to={href}>
                      {text}
                    </Link>
                  )}
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </main>
  )
}
