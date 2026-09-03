import { hasPermission } from '@nsheth/identity'

import type { Principal } from '@nsheth/identity'

export interface AdminModule {
  readonly id: string
  readonly group: string
  readonly label: string
  readonly href: string
  readonly permission: string
}

export function visibleAdminModules<T extends AdminModule>(
  modules: ReadonlyArray<T>,
  principal: Principal,
) {
  return modules.filter((module) => hasPermission(principal, module.permission))
}
