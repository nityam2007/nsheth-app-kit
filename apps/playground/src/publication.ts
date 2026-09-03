export function publicationDate(
  status: 'DRAFT' | 'PUBLISHED',
  current: Date | null,
  now = new Date(),
) {
  return status === 'PUBLISHED' ? (current ?? now) : null
}
