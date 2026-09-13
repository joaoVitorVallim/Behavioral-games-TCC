import { useNavigate } from 'react-router-dom'
import { ErrorScreen } from '../../shared/components/ErrorScreen'

/**
 * Catch-all for unmatched routes — previously there was none, so an unknown
 * URL fell through to React Router's own generic default page.
 */
export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <ErrorScreen
      title="Página não encontrada"
      message="O endereço acessado não existe ou foi movido."
      action_label="Voltar para o início"
      onAction={() => navigate('/')}
    />
  )
}
