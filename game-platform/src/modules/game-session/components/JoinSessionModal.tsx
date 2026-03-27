import { useState, useCallback } from 'react'
import type { Session, SessionRequirement } from '../types'
import { sessionService } from '../services/sessionService'
import { useJoinSession } from '../hooks/useJoinSession'
import { sanitizeString, validateSessionCode, validateInput } from '../../../shared/utils/validation'
import { RateLimiter } from '../../../shared/utils/security'

interface JoinSessionModalProps {
  session: Session
  onClose: () => void
  onSuccess: () => void
}

type ModalStep = 'code' | 'requirements'

const rate_limiter = new RateLimiter(5, 60000) // 5 tentativas por minuto

export const JoinSessionModal = ({ session, onClose, onSuccess }: JoinSessionModalProps) => {
  const [step, setStep] = useState<ModalStep>('code')
  const [code, setCode] = useState('')
  const [requirements, setRequirements] = useState<SessionRequirement[]>([])
  const [form_data, setFormData] = useState<Record<string, string>>({})
  const [is_validating, setIsValidating] = useState(false)
  const [validation_error, setValidationError] = useState('')

  const { joinSession, is_joining } = useJoinSession(session.id)

  const handleCodeSubmit = useCallback(async () => {
    // Validação básica
    if (!code.trim()) {
      setValidationError('Digite o código da sessão')
      return
    }

    // Valida formato do código
    if (!validateSessionCode(code)) {
      setValidationError('Código inválido')
      return
    }

    // Rate limiting
    if (!rate_limiter.canAttempt(`session-${session.id}`)) {
      setValidationError('Muitas tentativas. Aguarde um momento.')
      return
    }

    setIsValidating(true)
    setValidationError('')

    try {
      const sanitized_code = sanitizeString(code)
      const response = await sessionService.validateCode(session.id, sanitized_code)
      
      if (response.valid) {
        setRequirements(response.requirements)
        setStep('requirements')
        rate_limiter.reset(`session-${session.id}`) // Reset após sucesso
      } else {
        setValidationError('Código inválido')
      }
    } catch {
      setValidationError('Não foi possível validar o código. Tente novamente.')
    } finally {
      setIsValidating(false)
    }
  }, [code, session.id])

  const handleRequirementsSubmit = useCallback(() => {
    // Valida campos obrigatórios
    const all_required_filled = requirements
      .filter(req => req.required)
      .every(req => form_data[req.field]?.trim())

    if (!all_required_filled) {
      setValidationError('Preencha todos os campos obrigatórios')
      return
    }

    // Valida cada campo baseado no tipo
    const has_invalid_field = requirements.some(req => {
      const value = form_data[req.field]
      if (!value && req.required) return true
      if (value && !validateInput(value, req.type)) return true
      return false
    })

    if (has_invalid_field) {
      setValidationError('Um ou mais campos possuem valores inválidos')
      return
    }

    // Sanitiza todos os dados
    const sanitized_data: Record<string, string> = {}
    Object.keys(form_data).forEach(key => {
      sanitized_data[key] = sanitizeString(form_data[key])
    })

    joinSession({ code: sanitizeString(code), ...sanitized_data }, {
      onSuccess: () => {
        onSuccess()
        onClose()
      },
      onError: () => {
        setValidationError('Não foi possível entrar na sessão. Tente novamente.')
      }
    })
  }, [requirements, form_data, code, joinSession, onSuccess, onClose])

  const handleInputChange = useCallback((field: string, value: string) => {
    // Limita comprimento do input
    const max_length = 500
    const truncated_value = value.substring(0, max_length)
    
    setFormData(prev => ({ ...prev, [field]: truncated_value }))
    setValidationError('')
  }, [])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Entrar na Sessão"
      onClick={onClose}
    >
      <div 
        className="surface-panel relative w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center leading-none text-xl text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fechar"
        >
          ✕
        </button>

        {step === 'code' ? (
          <>
            <h2 className="text-xl font-bold text-popover-foreground mb-1.5">Entrar na Sessão</h2>
            <p className="text-muted-foreground text-sm mb-6">Digite o código fornecido pelo professor</p>

            <div className="mb-5">
              <label htmlFor="session-code" className="block text-sm font-medium text-popover-foreground mb-2.5">
                Código da Sessão
              </label>
              <input
                id="session-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setValidationError('')
                }}
                placeholder="A1AβA3"
                className="input-shell border-2 py-3.5 text-center text-lg tracking-[0.3em] placeholder:tracking-[0.3em]"
                maxLength={10}
              />
              {validation_error && (
                <p className="text-destructive text-xs mt-2">{validation_error}</p>
              )}
            </div>

            <button
              onClick={handleCodeSubmit}
              disabled={is_validating}
              className="btn-primary w-full py-3.5 disabled:cursor-not-allowed"
            >
              {is_validating ? 'Validando...' : 'Continuar'}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-popover-foreground mb-1.5">Dados para Entrada</h2>
            <p className="text-muted-foreground text-sm mb-6">Preencha os dados solicitados para entrar na sessão</p>

            <div className="space-y-4 mb-5">
              {requirements.map((req) => (
                <div key={req.field}>
                  <label htmlFor={`req-${req.field}`} className="block text-sm font-medium text-popover-foreground mb-2">
                    {req.label} {req.required && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    id={`req-${req.field}`}
                    type={req.type}
                    value={form_data[req.field] || ''}
                    onChange={(e) => handleInputChange(req.field, e.target.value)}
                    placeholder={req.placeholder}
                    required={req.required}
                    className="input-shell border-2 py-3.5"
                  />
                </div>
              ))}
            </div>

            {validation_error && (
              <p className="text-destructive text-xs mb-4">{validation_error}</p>
            )}

            <button
              onClick={handleRequirementsSubmit}
              disabled={is_joining}
              className="btn-primary w-full py-3.5 disabled:cursor-not-allowed"
            >
              {is_joining ? 'Entrando...' : 'Entrar na Sessão'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
