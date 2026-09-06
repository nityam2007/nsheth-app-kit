import { useState } from 'react'
import { Input } from './base/input/input'
import { Button } from './base/buttons/button'

export function StructuredRows({
  name,
  title,
  fields,
  initial = [],
  limit = 12,
}: {
  name: string
  title: string
  fields: Array<{ key: string; label: string; type?: 'url'; maxLength: number }>
  initial?: Array<Record<string, string>>
  limit?: number
}) {
  const [rows, setRows] = useState(
    initial.map((value, index) => ({ key: String(index), value })),
  )
  return (
    <fieldset className="grid min-w-0 gap-4 rounded-xl border border-secondary p-5">
      <legend className="px-2 font-semibold text-primary">{title}</legend>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(rows.map((row) => row.value))}
      />
      {rows.map((row, index) => (
        <div
          className="grid gap-3 border-b border-secondary pb-4 sm:grid-cols-[1fr_1fr_auto]"
          key={row.key}
        >
          {fields.map((field) => (
            <Input
              key={field.key}
              label={`${field.label} ${index + 1}`}
              type={field.type}
              isRequired
              maxLength={field.maxLength}
              value={row.value[field.key] ?? ''}
              onChange={(value) =>
                setRows((current) =>
                  current.map((item) =>
                    item.key === row.key
                      ? {
                          ...item,
                          value: { ...item.value, [field.key]: value },
                        }
                      : item,
                  ),
                )
              }
            />
          ))}
          <Button
            color="secondary"
            type="button"
            onPress={() =>
              setRows((current) =>
                current.filter((item) => item.key !== row.key),
              )
            }
          >
            Remove {index + 1}
          </Button>
        </div>
      ))}
      <div>
        <Button
          type="button"
          color="secondary"
          isDisabled={rows.length >= limit}
          onPress={() =>
            setRows((current) => [
              ...current,
              {
                key: crypto.randomUUID(),
                value: Object.fromEntries(
                  fields.map((field) => [field.key, '']),
                ),
              },
            ])
          }
        >
          Add {title.toLowerCase()} row
        </Button>
      </div>
      <p className="text-xs text-tertiary">
        Up to {limit} entries, displayed in this order.
      </p>
    </fieldset>
  )
}
