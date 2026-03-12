import { CheckCircle, Copy, Check } from 'lucide-react'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'

interface SessionCodeModalProps {
  invite_code: string
  onClose: () => void
}

export function SessionCodeModal({ invite_code, onClose }: SessionCodeModalProps) {
  const { copied, copy } = useCopyToClipboard()

  const handleCopy = () => copy(invite_code)

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Código da Sessão"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-3xl p-8 md:p-10 max-w-md w-full relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground hover:scale-125 transition-all text-xl w-8 h-8 flex items-center justify-center leading-none"
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

          {/* Code Display */}
          <div className="bg-background border border-border rounded-xl p-6 mb-6">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
              Código da Sessão
            </p>
            <p className="text-3xl font-bold text-primary tracking-wider select-all">
              {invite_code}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-105 hover:text-background transition-all flex items-center justify-center gap-2"
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
              className="px-6 py-3.5 bg-card text-foreground border border-border rounded-xl font-semibold hover:scale-105 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
