import { getPrisma } from './db'

export async function attachHistory<T extends { id: string }>(
  entityType: string,
  rows: T[],
) {
  const events = await getPrisma().auditEvent.findMany({
    where: { entityType, entityId: { in: rows.map((row) => row.id) } },
    orderBy: { createdAt: 'desc' },
    take: 2000,
    select: {
      id: true,
      entityId: true,
      action: true,
      summary: true,
      createdAt: true,
    },
  })
  return rows.map((row) => ({
    ...row,
    history: events.filter((event) => event.entityId === row.id).slice(0, 20),
  }))
}
