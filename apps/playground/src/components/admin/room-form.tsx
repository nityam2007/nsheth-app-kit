import { useServerFn } from '@tanstack/react-start'
import { saveRoom } from '../../hospitality.functions'
import { Input } from '../base/input/input'
import { TextArea } from '../base/textarea/textarea'
import { ActionForm, SelectField } from '../workflow'

interface Room {
  id: string
  name: string
  description: string
  inventory: number
  maxGuests: number
  nightlyRate: number
  active: boolean
}
export function RoomForm({
  propertyId,
  room,
}: {
  propertyId: string
  room?: Room
}) {
  const save = useServerFn(saveRoom)
  return (
    <ActionForm
      reset={!room}
      label={room ? 'Save room type' : 'Add room type'}
      action={(form) =>
        save({
          data: {
            id: room?.id,
            propertyId,
            name: String(form.get('name')),
            description: String(form.get('description')),
            inventory: Number(form.get('inventory')),
            maxGuests: Number(form.get('maxGuests')),
            nightlyRate: Math.round(Number(form.get('rate')) * 100),
            active: form.get('active') === 'true',
          },
        })
      }
    >
      <Input
        label="Room type name"
        name="name"
        isRequired
        minLength={2}
        maxLength={120}
        defaultValue={room?.name}
      />
      <TextArea
        label="Room description"
        name="description"
        isRequired
        maxLength={2000}
        defaultValue={room?.description}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Rooms available"
          name="inventory"
          type="number"
          min={1}
          max={500}
          isRequired
          defaultValue={String(room?.inventory ?? 1)}
        />
        <Input
          label="Guests per room"
          name="maxGuests"
          type="number"
          min={1}
          max={20}
          isRequired
          defaultValue={String(room?.maxGuests ?? 2)}
        />
        <Input
          label="Nightly rate (INR)"
          name="rate"
          type="number"
          min={0}
          max={100000}
          step="0.01"
          isRequired
          defaultValue={String((room?.nightlyRate ?? 500000) / 100)}
        />
      </div>
      <SelectField
        label="Availability"
        name="active"
        defaultValue={String(room?.active ?? true)}
      >
        <option value="true">Open for requests</option>
        <option value="false">Closed</option>
      </SelectField>
    </ActionForm>
  )
}
