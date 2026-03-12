import { ChevronDown } from 'lucide-react'
import type { CreateConfigPayload } from '../types'

// -- Option Constants --

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' }
]

const CARD_THEME_OPTIONS = [
  { value: 'standard', label: 'Padrão' },
  { value: 'classic', label: 'Clássico' },
  { value: 'modern', label: 'Moderno' },
  { value: 'minimal', label: 'Minimalista' }
]

// -- Toggle Component --

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

// -- Styles --

const input_class =
  'w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors'

const select_class =
  'w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors appearance-none'

const label_class = 'block text-sm font-medium text-foreground mb-2'

const section_label_class = 'text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4'

// -- Component --

interface ConfigurationFormProps {
  config: CreateConfigPayload
  game: string
  onChange: (config: CreateConfigPayload) => void
}

export function ConfigurationForm({ config, game, onChange }: ConfigurationFormProps) {
  const handleChange = <K extends keyof CreateConfigPayload>(
    field: K,
    value: CreateConfigPayload[K]
  ) => {
    onChange({ ...config, [field]: value })
  }

  return (
    <div className="space-y-8">
      {/* ── Basic Info ── */}
      <fieldset>
        <legend className={section_label_class}>Informações Básicas</legend>
        <div className="space-y-4">
          <div>
            <label htmlFor="config-name" className={label_class}>Nome da Configuração *</label>
            <input
              id="config-name"
              type="text"
              value={config.configName}
              onChange={(e) => handleChange('configName', e.target.value)}
              className={input_class}
              placeholder="Ex: Configuração Nível 1"
            />
          </div>

          <div>
            <label htmlFor="config-difficulty" className={label_class}>Dificuldade</label>
            <div className="relative">
              <select
                id="config-difficulty"
                value={config.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className={select_class}
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </fieldset>

      {/* ── General Settings ── */}
      <fieldset>
        <legend className={section_label_class}>Configurações Gerais</legend>
        <div className="space-y-4">
          <div>
            <label htmlFor="config-limit-rounds" className={label_class}>Limite de Rounds</label>
            <input
              id="config-limit-rounds"
              type="number"
              value={config.limitRounds}
              onChange={(e) => handleChange('limitRounds', Number(e.target.value))}
              min={1}
              max={100}
              className={input_class}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
            <div>
              <p className="text-sm font-medium text-foreground">Jogadores Veem Pontuação</p>
              <p className="text-xs text-muted-foreground">
                Permitir que os jogadores vejam a pontuação durante a partida
              </p>
            </div>
            <Toggle
              value={config.userViewPoints}
              onToggle={(v) => handleChange('userViewPoints', v)}
            />
          </div>
        </div>
      </fieldset>

      {/* ── Card Settings (only when game === 'cards') ── */}
      {game === 'cards' && (
        <fieldset>
          <legend className={section_label_class}>Configurações de Cards</legend>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="config-card-deck-size" className={label_class}>Tamanho do Deck</label>
                <input
                  id="config-card-deck-size"
                  type="number"
                  value={config.cardDeckSize}
                  onChange={(e) => handleChange('cardDeckSize', Number(e.target.value))}
                  min={1}
                  className={input_class}
                />
              </div>

              <div>
                <label htmlFor="config-card-theme" className={label_class}>Tema das Cartas</label>
                <div className="relative">
                  <select
                    id="config-card-theme"
                    value={config.cardTheme}
                    onChange={(e) => handleChange('cardTheme', e.target.value)}
                    className={select_class}
                  >
                    {CARD_THEME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
              <div>
                <p className="text-sm font-medium text-foreground">Cartas Especiais</p>
                <p className="text-xs text-muted-foreground">Incluir cartas especiais no deck</p>
              </div>
              <Toggle
                value={config.allowSpecialCards}
                onToggle={(v) => handleChange('allowSpecialCards', v)}
              />
            </div>
          </div>
        </fieldset>
      )}

      {/* ── Word Settings (only when game === 'words') ── */}
      {game === 'words' && (
        <fieldset>
          <legend className={section_label_class}>Configurações de Palavras</legend>
          <div className="space-y-4">
            <div>
              <label htmlFor="config-word-pool-size" className={label_class}>Pool de Palavras</label>
              <input
                id="config-word-pool-size"
                type="number"
                value={config.wordPoolSize}
                onChange={(e) => handleChange('wordPoolSize', Number(e.target.value))}
                min={1}
                className={input_class}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
              <div>
                <p className="text-sm font-medium text-foreground">Timer por Palavra</p>
                <p className="text-xs text-muted-foreground">Limitar o tempo para cada palavra</p>
              </div>
              <Toggle
                value={config.includeTimerPerWord}
                onToggle={(v) => handleChange('includeTimerPerWord', v)}
              />
            </div>

            {config.includeTimerPerWord && (
              <div>
                <label htmlFor="config-seconds-per-word" className={label_class}>Segundos por Palavra</label>
                <input
                  id="config-seconds-per-word"
                  type="number"
                  value={config.secondsPerWord}
                  onChange={(e) => handleChange('secondsPerWord', Number(e.target.value))}
                  min={5}
                  max={300}
                  className={input_class}
                />
              </div>
            )}
          </div>
        </fieldset>
      )}
    </div>
  )
}
