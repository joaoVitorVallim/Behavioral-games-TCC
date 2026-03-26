import { ChevronDown, Users } from 'lucide-react'
import { PLAYER_INFO_OPTIONS } from '../types'
import type { GameCatalogItem } from '../types'
import type { SessionAction } from '../hooks/useSessionCreation'

interface SessionDataFormProps {
  session_name: string
  selected_game: string
  games: GameCatalogItem[]
  games_loading: boolean
  games_error: boolean
  input_info: string[]
  dispatch: React.Dispatch<SessionAction>
}

export function SessionDataForm({
  session_name,
  selected_game,
  games,
  games_loading,
  games_error,
  input_info,
  dispatch
}: SessionDataFormProps) {
  return (
    <section
      className="bg-card border border-border rounded-2xl p-8 shadow-lg mb-8"
      aria-labelledby="section-session-data"
    >
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h2 id="section-session-data" className="text-2xl font-bold text-foreground">
          Dados da Sessão
        </h2>
      </div>

      <div className="space-y-6">
        {/* Session Name */}
        <div>
          <label htmlFor="session-name" className="block text-sm font-medium text-foreground mb-2">
            Nome da Sessão *
          </label>
          <input
            id="session-name"
            type="text"
            value={session_name}
            onChange={(e) => dispatch({ type: 'SET_SESSION_NAME', payload: e.target.value })}
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            placeholder="Ex: Sessão Turma A — Manhã"
          />
        </div>

        {/* Game Selection */}
        <div>
          <label htmlFor="session-game" className="block text-sm font-medium text-foreground mb-2">
            Jogo *
          </label>
          <div className="relative">
            <select
              id="session-game"
              value={selected_game}
              onChange={(e) => dispatch({ type: 'SET_GAME', payload: e.target.value })}
              disabled={games_loading || games_error || games.length === 0}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors appearance-none"
            >
              {games_loading && <option value="">Carregando jogos...</option>}
              {!games_loading && games.length > 0 && (
                <option value="" disabled>
                  Selecione um jogo
                </option>
              )}
              {!games_loading && games.length === 0 && (
                <option value="">Nenhum jogo disponível</option>
              )}
              {!games_loading && games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
          {games_error && (
            <p className="text-xs text-destructive mt-2">
              Nao foi possivel carregar os jogos no momento.
            </p>
          )}
        </div>

        {/* Player Info (session-level) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Dados do Jogador *
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Selecione quais informações serão solicitadas ao jogador ao entrar na sessão
          </p>
          <div className="flex flex-wrap gap-3">
            {PLAYER_INFO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_PLAYER_INFO', payload: opt.value })}
                className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                  input_info.includes(opt.value)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {input_info.length === 0 && (
            <p className="text-xs text-destructive mt-2">
              Selecione ao menos uma informação do jogador
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
