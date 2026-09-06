import { Input } from './base/input/input'
import { TextArea } from './base/textarea/textarea'
import { SelectField } from './workflow'

export function TriageFields({
  followUpAt,
  assigned,
}: {
  followUpAt: Date | null
  assigned: boolean
}) {
  return (
    <>
      <SelectField
        name="ownership"
        label={
          assigned ? 'Responsibility (assigned)' : 'Responsibility (unassigned)'
        }
      >
        <option value="keep">Keep current responsibility</option>
        <option value="claim">Assign to me</option>
        <option value="release">Leave unassigned</option>
      </SelectField>
      <Input
        name="followUpAt"
        label="Follow-up date"
        type="date"
        defaultValue={followUpAt?.toISOString().slice(0, 10) ?? ''}
      />
      <TextArea
        name="note"
        label="Internal follow-up note"
        minLength={5}
        maxLength={2000}
        isRequired
        hint="Record what happened and the next action. Visible only to authorized operators."
      />
    </>
  )
}
export function triageData(form: FormData) {
  const ownership = form.get('ownership')
  return {
    note: String(form.get('note')),
    ownership:
      ownership === 'claim'
        ? ('claim' as const)
        : ownership === 'release'
          ? ('release' as const)
          : ('keep' as const),
    followUpAt: form.get('followUpAt')
      ? String(form.get('followUpAt')) + 'T00:00:00Z'
      : '',
  }
}
