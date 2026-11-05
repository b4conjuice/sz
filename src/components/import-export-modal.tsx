import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/20/solid'
import { useCopyToClipboard } from '@uidotdev/usehooks'

import Modal from '@/components/modal'

export default function ImportExportModal<T>({
  object,
  setObject,
}: {
  object?: T
  setObject: Dispatch<SetStateAction<T>> | ((newObject: T) => void)
}) {
  const modalTitle = 'import / export'
  const [importText, setImportText] = useState('')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [copiedText, copyToClipboard] = useCopyToClipboard()
  return (
    <>
      <button
        className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
        type='button'
        onClick={() => {
          setIsExportModalOpen(true)
        }}
      >
        <ArrowUpTrayIcon className='h-6 w-6' />
      </button>
      <Modal
        title={modalTitle}
        isOpen={isExportModalOpen}
        setIsOpen={setIsExportModalOpen}
      >
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
                // toast.success('copied export json to clipboard')
              }}
              className='text-cb-yellow hover:text-cb-yellow/75 flex gap-2 disabled:pointer-events-none disabled:opacity-25'
            >
              <DocumentDuplicateIcon className='h-6 w-6' /> export
            </button>
            <hr className='border-cb-white' />
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
            // toast.success('updated')
            setImportText('')
          }}
          disabled={!importText}
          className='text-cb-yellow hover:text-cb-yellow/75 flex gap-2 disabled:pointer-events-none disabled:opacity-25'
        >
          <ArrowDownTrayIcon className='h-6 w-6' /> import
        </button>
      </Modal>
    </>
  )
}
