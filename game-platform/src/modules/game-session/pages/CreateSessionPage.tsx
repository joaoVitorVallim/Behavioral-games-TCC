import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { Header } from '../../../shared/components/Header'
import { SessionCodeModal } from '../components/SessionCodeModal'
import { SessionDataForm } from '../components/SessionDataForm'
import { ConfigSelector } from '../components/ConfigSelector'
import { SessionSummary } from '../components/SessionSummary'
import { useSessionCreation } from '../hooks/useSessionCreation'

export function CreateSessionPage() {
  const navigate = useNavigate()
  const {
    state,
    dispatch,
    configs_for_game,
    selected_config,
    active_config,
    can_create_session
  } = useSessionCreation()

  const handleCloseModal = () => {
    dispatch({ type: 'CLOSE_MODAL' })
    navigate('/sessions')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PlusCircle className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Criar Nova Sessão</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Defina os dados da sessão, configure a partida e comece
          </p>
        </div>

        <SessionDataForm
          session_name={state.session_name}
          selected_game={state.selected_game}
          input_info={state.input_info}
          dispatch={dispatch}
        />

        <ConfigSelector
          selected_game={state.selected_game}
          config_mode={state.config_mode}
          selected_config={selected_config}
          selected_config_id={state.selected_config_id}
          configs_for_game={configs_for_game}
          new_config={state.new_config}
          config_saved={state.config_saved}
          dispatch={dispatch}
        />

        <SessionSummary
          session_name={state.session_name}
          selected_game={state.selected_game}
          input_info={state.input_info}
          active_config={active_config}
          config_mode={state.config_mode}
          can_create_session={can_create_session}
          dispatch={dispatch}
        />
      </main>

      {/* Session Code Modal */}
      {state.show_code_modal && (
        <SessionCodeModal invite_code={state.session_code} onClose={handleCloseModal} />
      )}
    </div>
  )
}
