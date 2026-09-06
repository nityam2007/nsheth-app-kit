import { createMiddleware } from '@tanstack/react-start'
import { moduleEnabled, moduleDefinitions } from './app.config'
import { rejectRequest } from './server-utils'
import type { ModuleId } from './app.config'

export function moduleMiddleware(id: ModuleId) {
  return createMiddleware({ type: 'function' }).server(async ({ next }) => {
    const disabled = (process.env.APP_DISABLED_MODULES ?? '')
      .split(',')
      .map((value) => value.trim())
    if (
      !moduleEnabled(id) ||
      disabled.includes(id) ||
      moduleDefinitions
        .find((module) => module.id === id)
        ?.dependsOn.some((dependency) => disabled.includes(dependency))
    )
      rejectRequest(404, 'This feature is unavailable')
    return next()
  })
}
