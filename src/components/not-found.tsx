import Menu from '@/components/menu'

export default function NotFound() {
  return (
    <>
      <main className='flex grow flex-col gap-4 p-2'>not found</main>
      <footer className='bg-cb-dusty-blue sticky bottom-0 flex items-center justify-between px-2 pt-2 pb-6'>
        <div className='flex space-x-6'>
          <Menu />
        </div>
        <div className='flex space-x-6'></div>
      </footer>
    </>
  )
}
