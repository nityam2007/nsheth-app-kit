// Task descriptions are shared by navigation, the overview and collection help.
export const adminWorkflows: Partial<
  Record<
    string,
    {
      description: string
      steps: string
      createLabel?: string
      pendingStatus?: string
      pendingLabel?: string
    }
  >
> = {
  '/admin/products': {
    description: 'Products, prices and stock',
    steps:
      'Add a product → set price & inventory → publish. Orders appear in Orders; quote requests appear in Enquiries.',
    createLabel: 'Add a product',
    pendingStatus: 'DRAFT',
    pendingLabel: 'Review draft products',
  },
  '/admin/posts': {
    description: 'Articles and publishing',
    steps:
      'Write a draft → review the article → publish now or schedule a date. Open a post to edit it or restore a revision.',
    createLabel: 'Write a post',
    pendingStatus: 'DRAFT',
    pendingLabel: 'Review draft posts',
  },
  '/admin/services': {
    description: 'Services and available times',
    steps:
      'Create a service → add available times → publish. Review incoming requests in Appointments.',
    createLabel: 'Create a service',
  },
  '/admin/properties': {
    description: 'Properties, rooms and rates',
    steps:
      'Add a property → add room types, rates and inventory → publish. Review incoming stays in Reservations.',
    createLabel: 'Add a property',
  },
  '/admin/orders': {
    description: 'Customer orders and fulfilment',
    steps:
      'Open an order → check payment and items → fulfil or cancel. Cancellation restores reserved stock.',
    pendingStatus: 'PLACED',
    pendingLabel: 'Review placed orders',
  },
  '/admin/bookings': {
    description: 'Incoming appointment requests',
    steps:
      'Open a request → review the time and customer details → confirm or cancel. Set bookable times in Services.',
    pendingStatus: 'REQUESTED',
    pendingLabel: 'Review appointment requests',
  },
  '/admin/reservations': {
    description: 'Guest reservations and arrivals',
    steps:
      'Open a reservation → check dates, guests and room → confirm or cancel. Set room availability in Properties.',
    pendingStatus: 'REQUESTED',
    pendingLabel: 'Review reservation requests',
  },
  '/admin/enquiries': {
    description: 'Product quotes and follow-ups',
    steps:
      'Open an enquiry → review the customer’s needs → update its status and add an internal note.',
    pendingStatus: 'NEW',
    pendingLabel: 'Review new enquiries',
  },
  '/admin/privacy': {
    description: 'Privacy and contact requests',
    steps:
      'Open a request → review the details → record your follow-up and resolve it.',
    pendingStatus: 'OPEN',
    pendingLabel: 'Review open privacy requests',
  },
  '/admin/users': {
    description: 'Customer and team accounts',
    steps:
      'Open a person to review their account. Use Team access to change roles or disable access.',
  },
  '/admin/access': {
    description: 'Roles and account access',
    steps:
      'Choose a person → review their roles → save only the access they need.',
  },
}

export function collectionSearch(search: Record<string, unknown>): {
  status?: string
} {
  return {
    status:
      typeof search.status === 'string'
        ? search.status.slice(0, 32)
        : undefined,
  }
}
