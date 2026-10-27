import { Link, useLocation } from '@tanstack/react-router'
import { Bars2Icon } from '@heroicons/react/20/solid'
import {
  Menu as MenuRoot,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'

import { nav } from '@/lib/config'

export default function Menu() {
  const location = useLocation()
  const currentPath = location.pathname
  return (
    <MenuRoot as='div'>
      <MenuButton className='text-cb-yellow hover:text-cb-yellow/75'>
        <Bars2Icon className='h-6 w-6' />
      </MenuButton>

      <MenuItems
        className='bg-cb-dusty-blue/90 text-cb-white flex flex-col space-y-4 rounded p-4'
        anchor='bottom start'
      >
        {nav.map(({ text, href, disabled }) =>
          disabled ? (
            <MenuItem key={href}>
              <span className='opacity-50'>{text}</span>
            </MenuItem>
          ) : currentPath === href ? (
            <MenuItem key={href}>
              <span>{text}</span>
            </MenuItem>
          ) : (
            <MenuItem key={href}>
              <Link to={href} className='text-cb-pink hover:text-cb-pink/75'>
                {text}
              </Link>
            </MenuItem>
          )
        )}
      </MenuItems>
    </MenuRoot>
  )
}
