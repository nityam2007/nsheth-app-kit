import { createFileRoute } from '@tanstack/react-router'
import { AccountChallenge } from '../components/account-challenge'

export const Route = createFileRoute('/forgot-password')({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: Page,
})
function Page() {
  const { token } = Route.useSearch()
  return <AccountChallenge key={token} kind="RESET" token={token} />
}
