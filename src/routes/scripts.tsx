import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useCopyToClipboard, useLocalStorage } from '@uidotdev/usehooks'
import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/20/solid'

import Menu from '@/components/menu'
import { scripts } from '@/lib/scripts'
import type { Script } from '@/lib/scripts'
import { DEFAULT_TITLE } from '@/routes/__root'

export const Route = createFileRoute('/scripts')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: `scripts - ${DEFAULT_TITLE}` }],
  }),
})

function RouteComponent() {
  return (
    <>
      <main className='flex grow flex-col gap-4 p-4'>
        <h2>scripts</h2>
        {scripts.map(script => (
          <ScriptEditor key={script.id} script={script} />
        ))}
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

function ScriptEditor({ script }: { script: Script }) {
  const { id, name, description, defaultScript } = script
  const [savedScript, setSavedScript] = useLocalStorage(
    `sz-script-${id}`,
    defaultScript
  )
  const [draftScript, setDraftScript] = useState(savedScript)
  const [, copyToClipboard] = useCopyToClipboard()
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    setDraftScript(savedScript)
  }, [savedScript])

  useEffect(() => {
    if (!isCopied) return
    const timeout = setTimeout(() => setIsCopied(false), 1500)
    return () => clearTimeout(timeout)
  }, [isCopied])

  return (
    <section className='flex flex-col gap-3'>
      <div className='flex flex-col gap-1'>
        <h3>{name}</h3>
        <p className='text-sm'>{description}</p>
      </div>
      <button
        type='button'
        title='copy script'
        className='bg-cb-blue hover:bg-cb-off-blue relative w-full overflow-x-auto rounded-lg p-4 text-left'
        onClick={async () => {
          await copyToClipboard(savedScript)
          setIsCopied(true)
        }}
      >
        <pre className='font-mono text-sm whitespace-pre'>
          <code>{savedScript.trim()}</code>
        </pre>
        <span className='text-cb-yellow absolute top-2 right-2 flex items-center gap-1 text-xs'>
          {isCopied ? (
            <>
              <CheckIcon className='h-4 w-4' /> copied
            </>
          ) : (
            <>
              <DocumentDuplicateIcon className='h-4 w-4' /> copy
            </>
          )}
        </span>
      </button>
      <textarea
        className='bg-cobalt caret-cb-yellow focus:border-cb-light-blue text-cb-white min-h-64 w-full rounded-lg p-4 font-mono text-sm focus:ring-0'
        value={draftScript}
        onChange={e => {
          setDraftScript(e.target.value)
        }}
      />
      <div className='flex gap-6'>
        <button
          type='button'
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          disabled={draftScript === savedScript}
          onClick={() => {
            setSavedScript(draftScript)
          }}
        >
          save
        </button>
        <button
          type='button'
          className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
          disabled={
            savedScript === defaultScript && draftScript === defaultScript
          }
          onClick={() => {
            setSavedScript(defaultScript)
            setDraftScript(defaultScript)
          }}
        >
          reset to default
        </button>
      </div>
    </section>
  )
}
