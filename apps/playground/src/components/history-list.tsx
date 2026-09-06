export function HistoryList({
  events,
}: {
  events: Array<{
    id: string
    action: string
    summary: string
    createdAt: Date
  }>
}) {
  if (!events.length) return null
  return (
    <details className="mt-5 text-sm text-tertiary">
      <summary className="min-h-11 cursor-pointer py-3 font-semibold text-secondary">
        Activity history
      </summary>
      <ol className="grid gap-3">
        {events.map((event) => (
          <li key={event.id}>
            <time>
              {event.createdAt.toISOString().replace('T', ' ').slice(0, 16)} UTC
            </time>{' '}
            · {event.action}
            <p>{event.summary}</p>
          </li>
        ))}
      </ol>
    </details>
  )
}
