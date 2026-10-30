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
import Fuse from 'fuse.js'
import { useHotkeys } from '@tanstack/react-hotkeys'

export type Command = {
  id: string
  title: string
  subtitle?: string
  action: (args?: unknown) => void | Promise<void>
}

export default function CommandPalette({
  commands,
  placeholder = 'search commands',
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
  showLaunchButton,
}: {
  commands: Command[]
  placeholder?: string
  isOpen?: boolean
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
  showLaunchButton?: boolean
}) {
  const [internalIsOpen, internalSetIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const isOpen = externalIsOpen ?? internalIsOpen
  const setIsOpen = externalSetIsOpen ?? internalSetIsOpen
  const toggleIsOpen = () => {
    setIsOpen(!isOpen)
  }
  useHotkeys([
    {
      hotkey: 'Mod+K',
      callback: toggleIsOpen,
    },
    {
      hotkey: 'Control+K',
      callback: toggleIsOpen,
    },
  ])

  const fuse = new Fuse(commands, {
    keys: ['id', 'title', { name: 'name', weight: 2 }],
  })

  const filteredCommands = !query
    ? []
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
              <Combobox
                as='div'
                onChange={async (command: Command) => {
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
                {query && filteredCommands.length === 0 && (
                  <p className='p-4 text-sm text-gray-500'>no results found</p>
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
