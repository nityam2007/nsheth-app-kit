import { createFileRoute } from '@tanstack/react-router'
import { Route as Parent } from './admin.properties.$slug'
import { RoomForm } from '../components/admin/room-form'
import { WorkspaceHeading, RecordTrail } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/properties/$slug/rooms')({
  component: Rooms,
})
function Rooms() {
  const property = Parent.useLoaderData()
  return (
    <>
      <RecordTrail
        current="Rooms & rates"
        href={'/admin/properties/' + property.slug}
        label={property.name}
      />
      <WorkspaceHeading
        eyebrow="Host / Room inventory"
        title={property.name}
        description="Room types, capacity, rates and availability for this property."
      />{' '}
      <section className="max-w-3xl">
        <h2 className="mb-5 text-xl font-semibold text-primary">Room types</h2>
        {property.rooms.map((room) => (
          <details
            className="mb-5 rounded-xl border border-secondary bg-primary p-5"
            key={room.id}
          >
            <summary className="min-h-11 cursor-pointer font-semibold text-primary">
              {room.name} · {room.inventory} rooms ·{' '}
              {room.active ? 'Open' : 'Closed'}
            </summary>
            <RoomForm propertyId={property.id} room={room} />
          </details>
        ))}
        <h2 className="my-6 text-xl font-semibold text-primary">
          Add a room type
        </h2>
        <RoomForm propertyId={property.id} />
      </section>
    </>
  )
}
