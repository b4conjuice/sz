import type { Dispatch, SetStateAction } from 'react'

import Modal from '@/components/modal'

export default function ConfirmModal({
  isOpen,
  setIsOpen,
  confirmAction,
  title = 'are you sure?',
}: {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  confirmAction: () => void
  title?: string
}) {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title={title}>
      <div className='flex space-x-4'>
        <button
          onClick={() => {
            confirmAction()
            setIsOpen(false)
          }}
        >
          yes
        </button>
        <button
          onClick={() => {
            setIsOpen(false)
          }}
        >
          no
        </button>
      </div>
    </Modal>
  )
}
