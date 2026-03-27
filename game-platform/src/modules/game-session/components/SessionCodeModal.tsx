import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CheckCircle, Copy, Check } from 'lucide-react'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'

interface SessionCodeModalProps {
  invite_code: string
  onClose: () => void
}

export function SessionCodeModal({ invite_code, onClose }: SessionCodeModalProps) {
  const { copied, copy } = useCopyToClipboard()
  const code_ref = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    if (!code_ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const chars = invite_code.split('')
    const target = code_ref.current
    let index = 0
    target.textContent = ''

    const ticker = gsap.to({}, {
      duration: Math.max(0.8, chars.length * 0.12),
      onUpdate: () => {
        const next_index = Math.min(chars.length, Math.floor(ticker.progress() * chars.length) + 1)
        if (next_index !== index) {
          index = next_index
          target.textContent = chars.slice(0, index).join('')
        }
      }
    })

    return () => {
      ticker.kill()
      target.textContent = invite_code
    }
  }, [invite_code])

  const handleCopy = () => copy(invite_code)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Código da Sessão"
      onClick={onClose}
    >
      <div
        className="surface-panel relative w-full max-w-md p-8 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center leading-none text-xl text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sessão Criada!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Compartilhe o código abaixo com os participantes
          </p>

          <div className="surface-subtle mb-6 p-6">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
              Código da Sessão
            </p>
            <p ref={code_ref} className="font-data text-3xl font-bold text-primary tracking-wider select-all">
              {invite_code}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="btn-primary flex-1 py-3.5 font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Código
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="btn-secondary px-6 py-3.5"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
