import settings from './app.settings.json'

export const appConfig = settings
export const moduleDefinitions = [
  {
    id: 'content',
    label: 'Journal',
    href: '/blog',
    description: 'Articles, guides and updates.',
    dependsOn: [],
  },
  {
    id: 'product',
    label: 'Catalogue',
    href: '/catalogue',
    description: 'Explore product details and request a quote.',
    dependsOn: [],
  },
  {
    id: 'commerce',
    label: 'Shop',
    href: '/shop',
    description: 'Choose options, review prices and place an order.',
    dependsOn: ['product'],
  },
  {
    id: 'booking',
    label: 'Appointments',
    href: '/services',
    description: 'Find an available time and request an appointment.',
    dependsOn: [],
  },
  {
    id: 'hospitality',
    label: 'Stays',
    href: '/stays',
    description: 'Compare rooms and check availability for your dates.',
    dependsOn: ['booking'],
  },
  {
    id: 'operations',
    label: 'Operations',
    href: '/admin/enquiries',
    description: 'Manage enquiries and follow-up work.',
    dependsOn: ['product'],
  },
] as const
export type ModuleId = (typeof moduleDefinitions)[number]['id']
export function moduleEnabled(id: string) {
  const definition = moduleDefinitions.find((module) => module.id === id)
  return Boolean(
    definition &&
    appConfig.enabledModules.includes(id) &&
    definition.dependsOn.every((dependency) =>
      appConfig.enabledModules.includes(dependency),
    ),
  )
}
export const publicModules = moduleDefinitions.filter(
  (module) => module.id !== 'operations' && moduleEnabled(module.id),
)
