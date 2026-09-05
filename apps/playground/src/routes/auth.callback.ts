import { createFileRoute } from '@tanstack/react-router'
import { finishGithubLogin } from '../auth.server'

export const Route = createFileRoute('/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return await finishGithubLogin(request)
        } catch {
          return new Response(
            'Sign-in could not be completed. Please start again.',
            { status: 400 },
          )
        }
      },
    },
  },
})
