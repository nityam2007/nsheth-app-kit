import { getPrisma } from '../apps/playground/src/db'
const url = new URL(process.env.DATABASE_URL ?? '')
if (
  process.env.NODE_ENV === 'production' ||
  !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
  url.pathname !== '/nsheth_app_kit'
)
  throw new Error(
    'Demo seed is restricted to the local nsheth_app_kit development database.',
  )
const db = getPrisma()
try {
  await db.$transaction(async (tx) => {
    const product = await tx.product.upsert({
      where: { slug: 'demo-studio-notebook' },
      update: {},
      create: {
        name: 'Studio notebook',
        slug: 'demo-studio-notebook',
        summary: 'A durable notebook for ideas, meeting notes and daily work.',
        description:
          'A lay-flat notebook with numbered pages, a sturdy cover and an elastic closure.',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        sku: 'DEMO-NOTE-01',
        brand: 'Studio',
        category: 'Workspace',
        tags: ['stationery', 'desk'],
        forSale: true,
        price: 120000,
        stock: 24,
        specifications: [
          { label: 'Size', value: 'A5' },
          { label: 'Pages', value: '192' },
        ],
      },
    })
    await tx.product.upsert({
      where: { slug: 'demo-desk-organizer' },
      update: {},
      create: {
        name: 'Desk organizer',
        slug: 'demo-desk-organizer',
        summary: 'A home for the tools you use every day.',
        description:
          'Modular compartments for pens, cables and small accessories.',
        sku: 'DEMO-DESK-01',
        category: 'Workspace',
        status: 'DRAFT',
      },
    })
    await tx.post.upsert({
      where: { slug: 'demo-making-space-for-good-work' },
      update: {},
      create: {
        title: 'Making space for good work',
        slug: 'demo-making-space-for-good-work',
        excerpt: 'A few practical ways to shape a calmer workspace.',
        body: `## Start with the essentials

Keep the tools you use most within easy reach. Put the rest away.

## Build a small routine

- Clear your desk at the end of the day
- Write down the next useful step
- Leave room for a fresh start`,
        author: 'Studio team',
        tags: ['workspace', 'routines'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })
    const service = await tx.service.upsert({
      where: { slug: 'demo-workspace-consultation' },
      update: {},
      create: {
        name: 'Workspace consultation',
        slug: 'demo-workspace-consultation',
        summary: 'A focused session to plan your space and workflow.',
        description:
          'Bring your current setup and goals. Leave with a practical set of next steps.',
        status: 'PUBLISHED',
        durationMinutes: 60,
        location: 'Online — meeting link shared after confirmation',
        policy: 'Please bring a short outline of your workspace and goals.',
      },
    })
    const start = new Date()
    start.setUTCDate(start.getUTCDate() + 7)
    start.setUTCHours(9, 0, 0, 0)
    const slot = await tx.availabilitySlot.upsert({
      where: { serviceId_startsAt: { serviceId: service.id, startsAt: start } },
      update: {},
      create: {
        serviceId: service.id,
        startsAt: start,
        endsAt: new Date(start.getTime() + 3600000),
        capacity: 3,
      },
    })
    const property = await tx.property.upsert({
      where: { slug: 'demo-garden-house' },
      update: {},
      create: {
        name: 'Garden House',
        slug: 'demo-garden-house',
        summary:
          'A quiet guesthouse with light-filled rooms and a shared garden.',
        description:
          'A small place to slow down, work comfortably and explore the neighbourhood.',
        location: 'Ahmedabad',
        address: 'Demo address — development fixture',
        amenities: ['Wi-Fi', 'Garden', 'Workspace'],
        status: 'PUBLISHED',
        policy: 'Quiet hours begin at 10 PM.',
      },
    })
    let room = await tx.roomType.findFirst({
      where: { propertyId: property.id, name: 'Garden studio' },
    })
    room ??= await tx.roomType.create({
      data: {
        propertyId: property.id,
        name: 'Garden studio',
        description: 'A comfortable studio overlooking the garden.',
        inventory: 4,
        maxGuests: 2,
        nightlyRate: 450000,
        amenities: ['Desk', 'Wi-Fi'],
      },
    })
    const email = 'customer@demo.local',
      name = 'Demo Customer'
    if (
      !(await tx.enquiry.findFirst({ where: { email, productId: product.id } }))
    )
      await tx.enquiry.create({
        data: {
          productId: product.id,
          name,
          email,
          quantity: 20,
          message:
            'Could you quote twenty notebooks for our team workshop? We would like to discuss custom covers.',
        },
      })
    if (
      !(await tx.bookingRequest.findFirst({
        where: { email, slot: { serviceId: service.id } },
      }))
    )
      await tx.bookingRequest.create({
        data: {
          slotId: slot.id,
          name,
          email,
          notes:
            'We are setting up a shared studio and would like help with the layout.',
          cancelUntil: new Date(start.getTime() - 86400000),
        },
      })
    if (
      !(await tx.reservation.findFirst({
        where: { email, roomTypeId: room.id },
      }))
    ) {
      const checkIn = new Date(start)
      checkIn.setUTCHours(0, 0, 0, 0)
      await tx.reservation.create({
        data: {
          roomTypeId: room.id,
          name,
          email,
          checkIn,
          checkOut: new Date(checkIn.getTime() + 172800000),
          guests: 2,
          totalAmount: 900000,
          cancelUntilDate: new Date(checkIn.getTime() - 86400000)
            .toISOString()
            .slice(0, 10),
          cancellationTimezone: property.timezone,
        },
      })
    }
    if (!(await tx.privacyRequest.findFirst({ where: { email } })))
      await tx.privacyRequest.create({
        data: {
          name,
          email,
          request:
            'Please help me correct the contact name on my previous enquiry.',
        },
      })
  })
  console.log(
    'Development sample products, post, service, availability, property, rooms and inbox records are ready. Existing records were preserved.',
  )
} finally {
  await db.$disconnect()
}
