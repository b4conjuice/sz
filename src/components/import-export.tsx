import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useCopyToClipboard } from '@uidotdev/usehooks'
import {
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/20/solid'

export default function ImportExport<T>({
  object,
  setObject,
}: {
  object?: T
  setObject: Dispatch<SetStateAction<T>> | ((newObject: T) => void)
}) {
  const [importText, setImportText] = useState('')
  const [copiedText, copyToClipboard] = useCopyToClipboard()
  return (
    <>
      {object !== undefined && (
        <>
          <textarea
            className='bg-cobalt focu w-full border-0 p-4 focus:ring-0'
            defaultValue={JSON.stringify(object)}
            readOnly
          />
          <button
            onClick={async () => {
              await copyToClipboard(JSON.stringify(object))
              // TODO: add toast
              // toast.success('copied export json to clipboard')
            }}
            className='text-cb-yellow hover:text-cb-yellow/75 flex gap-2 disabled:pointer-events-none disabled:opacity-25'
          >
            <DocumentDuplicateIcon className='h-6 w-6' /> export
          </button>
          <hr className='border-cb-white/25' />
        </>
      )}
      <textarea
        className='bg-cobalt w-full p-4'
        value={importText}
        onChange={e => {
          setImportText(e.target.value)
        }}
      />
      <button
        onClick={() => {
          const newObject = JSON.parse(importText) as T
          setObject(newObject)
          // TODO: add toast
          // toast.success('updated')
          setImportText('')
        }}
        disabled={!importText}
        className='text-cb-yellow hover:text-cb-yellow/75 flex gap-2 disabled:pointer-events-none disabled:opacity-25'
      >
        <ArrowDownTrayIcon className='h-6 w-6' /> import
      </button>
    </>
  )
}
