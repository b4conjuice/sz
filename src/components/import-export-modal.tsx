import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/20/solid'

import Modal from '@/components/modal'
import ImportExport from '@/components/import-export'

export default function ImportExportModal<T>({
  object,
  setObject,
}: {
  object?: T
  setObject: Dispatch<SetStateAction<T>> | ((newObject: T) => void)
}) {
  const modalTitle = 'import / export'
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
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
        <ImportExport object={object} setObject={setObject} />
      </Modal>
    </>
  )
}
