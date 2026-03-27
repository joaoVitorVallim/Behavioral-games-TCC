import { PlusCircle, Settings } from 'lucide-react'
import type { CreateConfigPayload } from '../types'

interface SessionSummaryProps {
  session_name: string
  selected_game: string
  input_info: string[]
  active_config: CreateConfigPayload | null
  config_mode: 'select' | 'create'
  can_create_session: boolean
  is_creating: boolean
  create_error: string | null
  onCreateSession: () => void
}

export function SessionSummary({
  session_name,
  selected_game,
  input_info,
  active_config,
  config_mode,
  can_create_session,
  is_creating,
  create_error,
  onCreateSession
}: SessionSummaryProps) {
  return (
    <section
      className="surface-panel p-8"
      aria-labelledby="section-create"
    >
      <div className="flex items-center gap-3 mb-6">
        <PlusCircle className="w-6 h-6 text-primary" />
        <h2 id="section-create" className="text-3xl text-foreground">
          Criar Sessão
        </h2>
      </div>

      <div className="surface-subtle mb-6 space-y-3 p-5">
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
                ? active_config.configName
                : config_mode === 'select'
                  ? 'Selecione uma configuração existente'
                  : 'Preencha o nome da configuração'}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onCreateSession}
        disabled={!can_create_session || is_creating}
        className="btn-primary w-full py-4 text-lg disabled:cursor-not-allowed"
      >
        <Settings className="w-5 h-5" />
        {is_creating ? 'Criando Sessao...' : 'Criar Sessão'}
      </button>
      {create_error && (
        <p className="text-sm text-destructive mt-3">{create_error}</p>
      )}
    </section>
  )
}
