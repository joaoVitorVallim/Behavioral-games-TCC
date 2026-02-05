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
    } catch (error) {
      setValidationError('Não foi possível validar o código. Tente novamente.')
      console.error('Validation error:', error)
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
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-popover rounded-2xl p-8 max-w-md w-full relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground text-xl w-6 h-6 flex items-center justify-center leading-none"
        >
          ✕
        </button>

        {step === 'code' ? (
          <>
            <h2 className="text-xl font-bold text-popover-foreground mb-1.5">Entrar na Sessão</h2>
            <p className="text-muted-foreground text-sm mb-6">Digite o código fornecido pelo professor</p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-popover-foreground mb-2.5">
                Código da Sessão
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setValidationError('')
                }}
                placeholder="A1AβA3"
                className="w-full px-4 py-3.5 bg-input border-2 border-border rounded-lg text-foreground text-center text-lg tracking-[0.3em] placeholder:text-muted-foreground placeholder:tracking-[0.3em] focus:border-ring focus:outline-none transition-colors"
                maxLength={10}
              />
              {validation_error && (
                <p className="text-destructive text-xs mt-2">{validation_error}</p>
              )}
            </div>

            <button
              onClick={handleCodeSubmit}
              disabled={is_validating}
              className="w-full py-3.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-lg text-sm font-semibold transition-opacity"
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
                  <label className="block text-sm font-medium text-popover-foreground mb-2">
                    {req.label} {req.required && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    type={req.type}
                    value={form_data[req.field] || ''}
                    onChange={(e) => handleInputChange(req.field, e.target.value)}
                    placeholder={req.placeholder}
                    required={req.required}
                    className="w-full px-4 py-3.5 bg-input border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-colors"
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
              className="w-full py-3.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-lg text-sm font-semibold transition-opacity"
            >
              {is_joining ? 'Entrando...' : 'Entrar na Sessão'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
