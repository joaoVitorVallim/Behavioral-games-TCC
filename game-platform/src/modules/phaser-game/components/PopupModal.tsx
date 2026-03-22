import { useState, useCallback } from 'react'
import { X, Check } from 'lucide-react'
import type { BetPopupData } from '../types'

type PopupModalProps = {
  popupData: BetPopupData
  students: Array<{ id: string; name: string }>
  onConfirm: (markedStudentIds: string[]) => void
  onClose: () => void
  isLoading?: boolean
}

export function PopupModal({ popupData, students, onConfirm, onClose, isLoading = false }: PopupModalProps) {
  const [markedStudents, setMarkedStudents] = useState<Set<string>>(new Set())

  const handleToggleStudent = useCallback((studentId: string) => {
    setMarkedStudents((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        if (next.size < popupData.selectedStudentCount) {
          next.add(studentId)
        }
      }
      return next
    })
  }, [popupData.selectedStudentCount])

  const handleConfirm = useCallback(() => {
    onConfirm(Array.from(markedStudents))
  }, [markedStudents, onConfirm])

  const canConfirm = markedStudents.size === popupData.selectedStudentCount && !isLoading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Sorteio do Professor</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-muted-foreground hover:bg-card rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-lg text-foreground font-semibold mb-2">Frase do Professor:</p>
            <p className="text-base text-muted-foreground italic">{popupData.phrase}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-foreground">
                Selecione {popupData.selectedStudentCount} aluno(s):
              </p>
              <span className="text-sm text-muted-foreground">
                {markedStudents.size} / {popupData.selectedStudentCount}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
              {students.map((student) => {
                const isChecked = markedStudents.has(student.id)
                const isDisabled = !isChecked && markedStudents.size >= popupData.selectedStudentCount
                return (
                  <button
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    disabled={isDisabled || isLoading}
                    className={`p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                      isChecked
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-card hover:border-primary/50 text-foreground'
                    } ${(isDisabled || isLoading) && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-primary border-primary' : 'border-border'
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <span className="font-medium">{student.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Tempo ganho por aluno:</span>{' '}
              {popupData.timeGainedPerStudentSeconds}s
            </p>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-card transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
