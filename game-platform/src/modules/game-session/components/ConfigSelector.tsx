import { useRef, useState } from 'react'
import { ChevronDown, ListChecks, PlusCircle, Gamepad2, Trash2 } from 'lucide-react'
import { ConfigurationForm } from './ConfigurationForm'
import { useClickOutside } from '../../../shared/hooks/useClickOutside'
import type { CreateConfigPayload, GameConfig, GameConfigFieldDefinition } from '../types'
import type { SessionAction } from '../hooks/useSessionCreation'

interface ConfigSelectorProps {
  selected_game: string
  config_mode: 'select' | 'create'
  selected_config: GameConfig | null
  selected_config_id: string
  configs_for_game: GameConfig[]
  configs_loading: boolean
  configs_error: boolean
  new_config: CreateConfigPayload
  common_fields: GameConfigFieldDefinition[]
  game_fields: GameConfigFieldDefinition[]
  fields_loading: boolean
  fields_error: boolean
  is_deleting_config: boolean
  deleting_config_id: string | null
  onDeleteConfig: (id: string) => Promise<void>
  dispatch: React.Dispatch<SessionAction>
}

export function ConfigSelector({
  selected_game,
  config_mode,
  selected_config,
  selected_config_id,
  configs_for_game,
  configs_loading,
  configs_error,
  new_config,
  common_fields,
  game_fields,
  fields_loading,
  fields_error,
  is_deleting_config,
  deleting_config_id,
  onDeleteConfig,
  dispatch
}: ConfigSelectorProps) {
  const [is_dropdown_open, setIsDropdownOpen] = useState(false)
  const dropdown_ref = useRef<HTMLDivElement | null>(null)

  useClickOutside(dropdown_ref, () => setIsDropdownOpen(false), is_dropdown_open)

  const preview_entries = selected_config
    ? Object.entries(selected_config).filter(([key]) => !['id', 'createdAt', 'game'].includes(key))
    : []

  const format_label = (name: string): string =>
    name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (char) => char.toUpperCase())

  const safe_value = (value: unknown): string => {
    if (typeof value === 'boolean') return value ? 'Sim' : 'Nao'
    if (typeof value === 'number') return String(value)
    if (typeof value === 'string') return value
    return '-'
  }

  return (
    <section
      className="bg-card border border-border rounded-2xl p-8 shadow-lg mb-8"
      aria-labelledby="section-match-config"
    >
      <div className="flex items-center gap-3 mb-2">
        <Gamepad2 className="w-6 h-6 text-primary" />
        <h2 id="section-match-config" className="text-2xl font-bold text-foreground">
          Configuração da Partida
        </h2>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Parâmetros do jogo{' '}
        <span className="text-primary font-semibold capitalize">{selected_game}</span>
      </p>

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-8">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_CONFIG_MODE', payload: 'select' })}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
            config_mode === 'select'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:scale-105'
          }`}
        >
          <span className="flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            Usar Existente
          </span>
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_CONFIG_MODE', payload: 'create' })}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
            config_mode === 'create'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:scale-105'
          }`}
        >
          <span className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Criar Nova
          </span>
        </button>
      </div>

      {/* ── Select Existing Config ── */}
      {config_mode === 'select' && (
        <div>
          <label htmlFor="config-select" className="block text-sm font-medium text-foreground mb-2">
            Selecione uma configuração para{' '}
            <span className="capitalize text-primary">{selected_game}</span>
          </label>
          <div ref={dropdown_ref} className="relative">
            <button
              id="config-select"
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              disabled={configs_loading || configs_error || configs_for_game.length === 0}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors text-left disabled:opacity-70"
            >
              {configs_loading
                ? 'Carregando configuracoes...'
                : selected_config
                  ? selected_config.configName
                  : 'Selecione uma configuracao'}
            </button>
            <ChevronDown
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none transition-transform ${
                is_dropdown_open ? 'rotate-180' : 'rotate-0'
              }`}
            />

            {is_dropdown_open && !configs_loading && !configs_error && configs_for_game.length > 0 && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-card shadow-xl max-h-64 overflow-auto">
                <ul role="listbox" aria-label="Configuracoes existentes" className="p-2 space-y-1">
                  {configs_for_game.map((cfg) => {
                    const is_selected = cfg.id === selected_config_id
                    const is_deleting_item = is_deleting_config && deleting_config_id === cfg.id

                    return (
                      <li key={cfg.id} role="option" aria-selected={is_selected} className="group">
                        <div
                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${
                            is_selected
                              ? 'border-primary bg-primary/10'
                              : 'border-transparent hover:border-border hover:bg-background'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              dispatch({ type: 'SELECT_CONFIG', payload: cfg.id })
                              setIsDropdownOpen(false)
                            }}
                            className="flex-1 text-left px-2 py-1.5 text-sm text-foreground"
                          >
                            {cfg.configName}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              void onDeleteConfig(cfg.id)
                            }}
                            disabled={is_deleting_item}
                            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity px-2 py-1.5 rounded-md border border-destructive/50 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                            aria-label={`Excluir configuracao ${cfg.configName}`}
                            title="Excluir configuracao"
                          >
                            {is_deleting_item ? (
                              <span className="text-xs">Excluindo...</span>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {configs_error && (
            <p className="text-xs text-destructive mt-2">
              Nao foi possivel carregar as configuracoes deste jogo.
            </p>
          )}

          {/* Config Preview */}
          {selected_config && (
            <div className="mt-6 p-6 bg-background border border-border rounded-xl">
              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">
                Resumo da Configuração
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {preview_entries.map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground">{format_label(key)}</p>
                    <p className="text-sm text-foreground font-medium">{safe_value(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {configs_for_game.length === 0 && (
            <div className="mt-4 p-4 bg-background border border-border rounded-xl text-center">
              <p className="text-muted-foreground text-sm">
                Nenhuma configuração encontrada para{' '}
                <span className="capitalize font-medium">{selected_game}</span>. Crie uma nova.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Create New Config ── */}
      {config_mode === 'create' && (
        <div>
          {fields_loading && (
            <p className="text-sm text-muted-foreground mb-4">Carregando campos de configuracao...</p>
          )}
          {fields_error && (
            <p className="text-sm text-destructive mb-4">
              Nao foi possivel carregar os campos da configuracao para este jogo.
            </p>
          )}
          <ConfigurationForm
            config={new_config}
            common_fields={common_fields}
            game_fields={game_fields}
            onChange={(config: CreateConfigPayload) =>
              dispatch({ type: 'UPDATE_NEW_CONFIG', payload: config })
            }
          />
        </div>
      )}
    </section>
  )
}
