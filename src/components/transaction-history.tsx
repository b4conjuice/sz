import type { Transaction } from '@/lib/use-teams'

const TRANSACTION_LABELS: Record<Transaction['type'], string> = {
  add: 'add',
  'add/drop': 'add / drop',
  drop: 'drop',
  'move-into-ir': 'move into ir',
  'move-out-of-ir': 'move out of ir',
}

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export function TransactionHistory({
  transactions = [],
}: {
  transactions?: Transaction[]
}) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return (
    <>
      <h2>transactions</h2>
      {sortedTransactions.length === 0 ? (
        <p className='opacity-75'>no transactions yet</p>
      ) : (
        <ul className='divide-cb-dusty-blue divide-y'>
          {sortedTransactions.map((transaction, index) => (
            <li key={index} className='flex gap-2 py-4 first:pt-0'>
              <span className='w-24 shrink-0'>
                {formatDate(transaction.date)}
              </span>
              <span className='w-28 shrink-0'>
                {TRANSACTION_LABELS[transaction.type]}
              </span>
              <span className='flex grow flex-wrap gap-x-3'>
                {transaction.players.map(player => (
                  <span key={player.name}>
                    {player.name}
                    {player.position.length > 0 && (
                      <span className='opacity-75'>
                        {' '}
                        {player.position.join(', ')}
                      </span>
                    )}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
