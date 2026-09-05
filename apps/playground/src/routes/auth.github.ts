import { createFileRoute } from '@tanstack/react-router'
import { beginGithubLogin } from '../auth.server'

export const Route = createFileRoute('/auth/github')({
  server: {
    handlers: {
      GET: async () => {
        try {
          return await beginGithubLogin()
        } catch {
          return new Response(
            'Sign-in is not configured. Contact the site operator.',
            { status: 503 },
          )
        }
      },
    },
  },
})
