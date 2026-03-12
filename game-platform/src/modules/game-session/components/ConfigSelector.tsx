import { ChevronDown, ListChecks, PlusCircle, Save, Gamepad2 } from 'lucide-react'
import { ConfigurationForm } from './ConfigurationForm'
import type { CreateConfigPayload, GameConfig } from '../types'
import type { SessionAction } from '../hooks/useSessionCreation'

interface ConfigSelectorProps {
  selected_game: string
  config_mode: 'select' | 'create'
  selected_config: GameConfig | null
  selected_config_id: string
  configs_for_game: GameConfig[]
  new_config: CreateConfigPayload
  config_saved: boolean
  dispatch: React.Dispatch<SessionAction>
}

export function ConfigSelector({
  selected_game,
  config_mode,
  selected_config,
  selected_config_id,
  configs_for_game,
  new_config,
  config_saved,
  dispatch
}: ConfigSelectorProps) {
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
          <div className="relative">
            <select
              id="config-select"
              value={selected_config_id}
              onChange={(e) => dispatch({ type: 'SELECT_CONFIG', payload: e.target.value })}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="">Selecione uma configuração</option>
              {configs_for_game.map((cfg) => (
                <option key={cfg.id} value={cfg.id}>
                  {cfg.configName} — {cfg.difficulty}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Config Preview */}
          {selected_config && (
            <div className="mt-6 p-6 bg-background border border-border rounded-xl">
              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">
                Resumo da Configuração
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Dificuldade</p>
                  <p className="text-sm text-foreground font-medium capitalize">
                    {selected_config.difficulty}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Limite de Rounds</p>
                  <p className="text-sm text-foreground font-medium">
                    {selected_config.limitRounds}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ver Pontuação</p>
                  <p className="text-sm text-foreground font-medium">
                    {selected_config.userViewPoints ? 'Sim' : 'Não'}
                  </p>
                </div>
                {selected_game === 'cards' && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Tamanho do Deck</p>
                      <p className="text-sm text-foreground font-medium">
                        {selected_config.cardDeckSize}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cartas Especiais</p>
                      <p className="text-sm text-foreground font-medium">
                        {selected_config.allowSpecialCards ? 'Sim' : 'Não'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tema</p>
                      <p className="text-sm text-foreground font-medium capitalize">
                        {selected_config.cardTheme}
                      </p>
                    </div>
                  </>
                )}
                {selected_game === 'words' && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Pool de Palavras</p>
                      <p className="text-sm text-foreground font-medium">
                        {selected_config.wordPoolSize}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Timer por Palavra</p>
                      <p className="text-sm text-foreground font-medium">
                        {selected_config.includeTimerPerWord
                          ? `${selected_config.secondsPerWord}s`
                          : 'Não'}
                      </p>
                    </div>
                  </>
                )}
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
          <ConfigurationForm
            config={new_config}
            game={selected_game}
            onChange={(config) => dispatch({ type: 'UPDATE_NEW_CONFIG', payload: config })}
          />

          <div className="mt-6 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SAVE_CONFIG' })}
              disabled={!new_config.configName}
              className="px-6 py-3 bg-background border border-border text-foreground rounded-xl font-semibold hover:scale-105 hover:border-primary transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Configuração para Reutilizar
            </button>
            {config_saved && (
              <p className="text-sm text-primary mt-2">✓ Configuração salva com sucesso!</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
