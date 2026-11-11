import { Fragment, useState } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import {
  RocketLaunchIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import classNames from 'classnames'
import Fuse from 'fuse.js'
import { useHotkeys } from '@tanstack/react-hotkeys'
import type { RegisterableHotkey } from '@tanstack/react-hotkeys'

export type Command = {
  id: string
  title: string
  subtitle?: string
  action: (args?: unknown) => void | Promise<void>
}

export type CommandFilterGroup = {
  id: string
  label?: string
  options: string[]
  selected: string[]
  onToggle: (option: string) => void
}

export default function CommandPalette({
  commands,
  placeholder = 'search commands',
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  showLaunchButton,
  toggleIsOpenHotKey,
  filterGroups,
}: {
  commands: Command[]
  placeholder?: string
  isOpen?: boolean
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
  showLaunchButton?: boolean
  toggleIsOpenHotKey?: RegisterableHotkey | RegisterableHotkey[]
  filterGroups?: CommandFilterGroup[]
}) {
  const [internalIsOpen, internalSetIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const isOpen = externalIsOpen ?? internalIsOpen
  const setIsOpen = externalSetIsOpen ?? internalSetIsOpen
  const toggleIsOpen = () => {
    setIsOpen(!isOpen)
  }
  const defaultToggleIsOpenHotkeys: RegisterableHotkey[] = [
    'Mod+K',
    'Control+K',
  ]
  const hotkeys =
    toggleIsOpenHotKey === undefined
      ? defaultToggleIsOpenHotkeys
      : Array.isArray(toggleIsOpenHotKey)
        ? toggleIsOpenHotKey
        : [toggleIsOpenHotKey]
  useHotkeys([
    ...hotkeys.map(hotkey => ({
      hotkey,
      callback: toggleIsOpen,
    })),
  ])

  const fuse = new Fuse(commands, {
    keys: ['id', 'title', { name: 'name', weight: 2 }],
  })

  const hasActiveFilters =
    filterGroups?.some(group => group.selected.length > 0) ?? false
  const filteredCommands = !query
    ? hasActiveFilters
      ? commands
      : []
    : fuse.search(query.toLowerCase()).map(({ item }) => item)
  return (
    <>
      <Transition show={isOpen} as={Fragment} afterLeave={() => setQuery('')}>
        <Dialog
          onClose={setIsOpen}
          className='fixed inset-0 overflow-y-auto p-4 pt-[25vh]'
        >
          <TransitionChild
            enter='duration-300 ease-out'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='duration-200 ease-in'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <DialogBackdrop className='bg-cobalt/75 fixed inset-0' />
          </TransitionChild>
          <TransitionChild
            enter='duration-300 ease-out'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='duration-200 ease-in'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <DialogPanel>
              {/* TODO: retheme the command palette to match the cobalt app theme */}
              <Combobox
                as='div'
                onChange={async (command: Command | null) => {
                  if (!command) {
                    return
                  }
                  await command.action()
                  setIsOpen(false)
                }}
                className='relative mx-auto max-w-lg divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5'
              >
                <div className='flex items-center space-x-2 px-4'>
                  <MagnifyingGlassIcon className='h-6 w-6 text-gray-500' />
                  <ComboboxInput
                    autoFocus
                    onChange={e => {
                      setQuery(e.target.value)
                    }}
                    className='placholder-gray-400 h-12 w-full border-0 bg-transparent text-gray-800 focus:ring-0 focus:outline-0'
                    placeholder={placeholder}
                  />
                </div>
                {filterGroups?.map(group =>
                  group.options.length > 0 ? (
                    <div
                      key={group.id}
                      className='flex items-start gap-2 px-4 py-2'
                    >
                      {group.label && (
                        <span className='shrink-0 pt-2 text-xs text-gray-500'>
                          {group.label}
                        </span>
                      )}
                      <ul className='flex gap-2 overflow-x-auto'>
                        {group.options.map(option => (
                          <li key={option} className='shrink-0'>
                            <button
                              className={classNames(
                                'rounded-lg border p-2 text-sm text-nowrap',
                                group.selected.includes(option)
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                              )}
                              type='button'
                              onMouseDown={e => {
                                e.preventDefault()
                              }}
                              onClick={() => {
                                group.onToggle(option)
                              }}
                            >
                              {option}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                )}
                {filteredCommands.length > 0 && (
                  <ComboboxOptions
                    static
                    className='max-h-40 overflow-y-auto py-4 text-sm'
                  >
                    {filteredCommands.map(command => (
                      <ComboboxOption key={command.id} value={command}>
                        {({ active }) => (
                          <div
                            className={`space-x-1 px-4 py-2 ${
                              active ? 'bg-indigo-600' : 'bg-white'
                            }`}
                          >
                            <span
                              className={`font-medium ${
                                active ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {command.title}
                            </span>
                            {command.subtitle && (
                              <span
                                className={`${
                                  active ? 'text-indigo-200' : 'text-gray-400'
                                }`}
                              >
                                - {command.subtitle}
                              </span>
                            )}
                          </div>
                        )}
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                )}
                {(query || hasActiveFilters) &&
                  filteredCommands.length === 0 && (
                    <p className='p-4 text-sm text-gray-500'>
                      no results found
                    </p>
                  )}
              </Combobox>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
      {externalSetIsOpen === undefined && showLaunchButton && (
        <button
          className='bg-cb-off-blue absolute right-4 bottom-16 block rounded-lg p-2 md:hidden'
          type='button'
          onClick={() => {
            setIsOpen(!isOpen)
          }}
        >
          <RocketLaunchIcon className='text-cb-yellow h-6 w-6' />
        </button>
      )}
    </>
  )
}
