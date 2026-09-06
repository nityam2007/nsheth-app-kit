import { notFound } from '@tanstack/react-router'
import { moduleEnabled } from './app.config'
import type { ModuleId } from './app.config'

export function requireRouteModule(id: ModuleId) {
  if (!moduleEnabled(id)) throw notFound()
}
