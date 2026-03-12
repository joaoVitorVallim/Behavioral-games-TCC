import { PlusCircle, Settings } from 'lucide-react'
import type { CreateConfigPayload } from '../types'
import type { SessionAction } from '../hooks/useSessionCreation'

interface SessionSummaryProps {
  session_name: string
  selected_game: string
  input_info: string[]
  active_config: CreateConfigPayload | null
  config_mode: 'select' | 'create'
  can_create_session: boolean
  dispatch: React.Dispatch<SessionAction>
}

export function SessionSummary({
  session_name,
  selected_game,
  input_info,
  active_config,
  config_mode,
  can_create_session,
  dispatch
}: SessionSummaryProps) {
  return (
    <section
      className="bg-card border border-border rounded-2xl p-8 shadow-lg"
      aria-labelledby="section-create"
    >
      <div className="flex items-center gap-3 mb-6">
        <PlusCircle className="w-6 h-6 text-primary" />
        <h2 id="section-create" className="text-2xl font-bold text-foreground">
          Criar Sessão
        </h2>
      </div>

      {/* Summary */}
      <div className="mb-6 p-5 bg-background border border-border rounded-xl space-y-3">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
          Resumo
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Sessão</p>
            <p className="text-foreground font-medium">
              {session_name.trim() || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Jogo</p>
            <p className="text-foreground font-medium capitalize">{selected_game}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dados do Jogador</p>
            <p className="text-foreground font-medium">
              {input_info.length > 0 ? input_info.join(', ') : '—'}
            </p>
          </div>
          <div className="col-span-2 md:col-span-3">
            <p className="text-xs text-muted-foreground">Configuração da Partida</p>
            <p className="text-foreground font-medium">
              {active_config
                ? `${active_config.configName} — ${active_config.difficulty}`
                : config_mode === 'select'
                  ? 'Selecione uma configuração existente'
                  : 'Preencha o nome da configuração'}
            </p>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <button
        type="button"
        onClick={() => dispatch({ type: 'CREATE_SESSION' })}
        disabled={!can_create_session}
        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-105 hover:text-background transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:text-primary-foreground flex items-center justify-center gap-2"
      >
        <Settings className="w-5 h-5" />
        Criar Sessão
      </button>
    </section>
  )
}
