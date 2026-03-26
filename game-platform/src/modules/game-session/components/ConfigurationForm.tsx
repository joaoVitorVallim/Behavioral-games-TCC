import { ChevronDown } from 'lucide-react'
import type { CreateConfigPayload, GameConfigFieldDefinition } from '../types'

function Toggle({ value, onToggle }: { value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onToggle(!value)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        value ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-foreground transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

const input_class =
  'w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors'

const select_class =
  'w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors appearance-none'

const label_class = 'block text-sm font-medium text-foreground mb-2'

const section_label_class = 'text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4'

const format_label = (name: string): string =>
  name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase())

const parse_enum_options = (field_type: string): string[] => {
  const match = /^enum\((.+)\)$/.exec(field_type)
  if (!match) return []
  return match[1]
    .split(/[,|]/)
    .map((option) => option.trim())
    .filter(Boolean)
}

interface ConfigurationFormProps {
  config: CreateConfigPayload
  common_fields: GameConfigFieldDefinition[]
  game_fields: GameConfigFieldDefinition[]
  onChange: (config: CreateConfigPayload) => void
}

export function ConfigurationForm({
  config,
  common_fields,
  game_fields,
  onChange
}: ConfigurationFormProps) {
  const handleChange = (field: string, value: string | number | boolean) => {
    onChange({ ...config, [field]: value })
  }

  const render_field = (field: GameConfigFieldDefinition) => {
    if (field.name === 'game') return null

    const field_label = format_label(field.name)
    const field_value = config[field.name]

    if (field.type === 'boolean') {
      return (
        <div key={field.name} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
          <div>
            <p className="text-sm font-medium text-foreground">{field_label}</p>
          </div>
          <Toggle
            value={Boolean(field_value)}
            onToggle={(next_value) => handleChange(field.name, next_value)}
          />
        </div>
      )
    }

    if (field.type === 'number') {
      return (
        <div key={field.name}>
          <label htmlFor={`config-${field.name}`} className={label_class}>{field_label}</label>
          <input
            id={`config-${field.name}`}
            type="number"
            value={typeof field_value === 'number' ? field_value : 0}
            onChange={(e) => handleChange(field.name, Number(e.target.value))}
            className={input_class}
          />
        </div>
      )
    }

    if (/^enum\(.+\)$/.test(field.type)) {
      const options = parse_enum_options(field.type)
      return (
        <div key={field.name}>
          <label htmlFor={`config-${field.name}`} className={label_class}>{field_label}</label>
          <div className="relative">
            <select
              id={`config-${field.name}`}
              value={typeof field_value === 'string' ? field_value : options[0] ?? ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={select_class}
              disabled={options.length === 0}
            >
              {options.length === 0 && <option value="">Sem opcoes disponiveis</option>}
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )
    }

    return (
      <div key={field.name}>
        <label htmlFor={`config-${field.name}`} className={label_class}>{field_label}</label>
        <input
          id={`config-${field.name}`}
          type="text"
          value={typeof field_value === 'string' ? field_value : ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className={input_class}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className={section_label_class}>Configuracoes Comuns</legend>
        <div className="space-y-4">
          {common_fields.map(render_field)}
        </div>
      </fieldset>

      <fieldset>
        <legend className={section_label_class}>Configuracoes Especificas do Jogo</legend>
        <div className="space-y-4">
          {game_fields.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum campo especifico para este jogo.</p>
          )}
          {game_fields.map(render_field)}
        </div>
      </fieldset>
    </div>
  )
}
