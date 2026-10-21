export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-cb-dark-blue text-cb-white flex min-h-screen flex-col'>
      {children}
    </div>
  )
}
