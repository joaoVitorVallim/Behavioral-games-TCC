import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Session, SessionRequirement, JoinSessionPayload, JoinSessionResponse } from '../types'
import { useJoinSession } from '../hooks/useJoinSession'
import { sanitizeString, validateSessionCode, validateInput } from '../../../shared/utils/validation'
import { RateLimiter } from '../../../shared/utils/security'

interface JoinSessionModalProps {
  session: Session
  onClose: () => void
  onSuccess: () => void
}

type ModalStep = 'code' | 'requirements'

const rate_limiter = new RateLimiter(5, 60000)

const EDUCATION_LEVEL_OPTIONS = [
  { value: 'elementary',    label: 'Ensino Fundamental' },
  { value: 'high_school',   label: 'Ensino Médio' },
  { value: 'technical',     label: 'Técnico' },
  { value: 'bachelor',      label: 'Graduação' },
  { value: 'postgraduate',  label: 'Pós-graduação' },
]

// Definições dos campos de jogador disponíveis no backend
const PLAYER_FIELD_DEFS: Record<string, Omit<SessionRequirement, 'field' | 'required'>> = {
  educationLevel: { label: 'Nível de Escolaridade', type: 'select', placeholder: 'Selecione' },
  semester:       { label: 'Semestre',              type: 'number', placeholder: 'Ex: 6' },
  course:         { label: 'Curso',                 type: 'text',   placeholder: 'Ex: Psicologia' },
  age:            { label: 'Idade',                 type: 'number', placeholder: 'Ex: 22' },
  gender:         { label: 'Gênero',                type: 'text',   placeholder: 'Ex: Masculino' },
  profession:     { label: 'Profissão',             type: 'text',   placeholder: 'Ex: Estudante' },
}

const GAME_ROUTES: Record<string, string> = {
  prisoner: '/prisoner/waiting',
}

export const JoinSessionModal = ({ session, onClose, onSuccess }: JoinSessionModalProps) => {
  const navigate = useNavigate()
  const [step, setStep] = useState<ModalStep>('code')
  const [code, setCode] = useState('')
  const [form_data, setFormData] = useState<Record<string, string>>({})
  const [validation_error, setValidationError] = useState('')

  const { joinSession, is_joining } = useJoinSession(session.id)

  // Deriva os requisitos diretamente do session.inputInfo, sem chamada de API
  const requirements: SessionRequirement[] = session.inputInfo
    .filter(field => field in PLAYER_FIELD_DEFS)
    .map(field => ({
      field,
      required: true,
      ...PLAYER_FIELD_DEFS[field],
    }))

  const handleJoin = useCallback((extra_data: Record<string, string>) => {
    const payload: JoinSessionPayload = {
      inviteCode: code.trim().toUpperCase(),
    }

    // Converte campos numéricos corretamente
    const mutable = payload as unknown as Record<string, unknown>
    for (const req of requirements) {
      const raw = extra_data[req.field]
      if (!raw) continue
      mutable[req.field] = req.type === 'number' ? Number(raw) : sanitizeString(raw)
    }

    joinSession(payload, {
      onSuccess: (data: JoinSessionResponse) => {
        sessionStorage.setItem('playerId', data.player.id)
        sessionStorage.setItem('sessionId', data.session.id)
        sessionStorage.setItem('matchId', data.match?.id ?? '')

        onSuccess()
        onClose()

        const game_route = GAME_ROUTES[session.game]
        if (game_route) {
          navigate(game_route)
        }
      },
      onError: () => {
        setValidationError('Não foi possível entrar na sessão. Verifique o código e tente novamente.')
      }
    })
  }, [code, requirements, joinSession, onSuccess, onClose, navigate, session.game])

  const handleCodeSubmit = useCallback(() => {
    if (!code.trim()) {
      setValidationError('Digite o código da sessão')
      return
    }

    if (!validateSessionCode(code)) {
      setValidationError('Código inválido')
      return
    }

    if (!rate_limiter.canAttempt(`session-${session.id}`)) {
      setValidationError('Muitas tentativas. Aguarde um momento.')
      return
    }

    // Valida o código localmente comparando com o inviteCode da sessão
    if (code.trim().toUpperCase() !== session.inviteCode.toUpperCase()) {
      setValidationError('Código inválido')
      return
    }

    rate_limiter.reset(`session-${session.id}`)
    setValidationError('')

    // Se a sessão não exige campos adicionais, faz o join direto
    if (requirements.length === 0) {
      handleJoin({})
      return
    }

    setStep('requirements')
  }, [code, session.id, session.inviteCode, requirements.length, handleJoin])

  const handleRequirementsSubmit = useCallback(() => {
    const all_required_filled = requirements
      .filter(req => req.required)
      .every(req => form_data[req.field]?.trim())

    if (!all_required_filled) {
      setValidationError('Preencha todos os campos obrigatórios')
      return
    }

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

    setValidationError('')
    handleJoin(form_data)
  }, [requirements, form_data, handleJoin])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value.substring(0, 500) }))
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
                placeholder="A1B2C3"
                className="input-shell border-2 py-3.5 text-center text-lg tracking-[0.3em] placeholder:tracking-[0.3em]"
                maxLength={10}
                onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
              />
              {validation_error && (
                <p className="text-destructive text-xs mt-2">{validation_error}</p>
              )}
            </div>

            <button
              onClick={handleCodeSubmit}
              disabled={is_joining}
              className="btn-primary w-full py-3.5 disabled:cursor-not-allowed"
            >
              {is_joining ? 'Entrando...' : 'Continuar'}
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
                  {req.type === 'select' ? (
                    <select
                      id={`req-${req.field}`}
                      value={form_data[req.field] || ''}
                      onChange={(e) => handleInputChange(req.field, e.target.value)}
                      required={req.required}
                      className="input-shell border-2 py-3.5 w-full"
                    >
                      <option value="">Selecione...</option>
                      {EDUCATION_LEVEL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`req-${req.field}`}
                      type={req.type}
                      value={form_data[req.field] || ''}
                      onChange={(e) => handleInputChange(req.field, e.target.value)}
                      placeholder={req.placeholder}
                      required={req.required}
                      className="input-shell border-2 py-3.5"
                    />
                  )}
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
