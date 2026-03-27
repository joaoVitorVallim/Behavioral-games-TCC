import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Header } from '../../../shared/components/Header'
import { FileText, CalendarDays, Filter, Download, ExternalLink, MoreHorizontal } from 'lucide-react'

export function ReportsPage() {
  const root_ref = useRef<HTMLDivElement | null>(null)
  const [is_details_open, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    if (!root_ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-reports="title"], [data-reports="table"]',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.08
        }
      )
    }, root_ref)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root_ref} className="app-shell">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <section data-reports="title" className="surface-panel mb-8 px-6 py-7 md:px-10 md:py-8">
          <div className="mb-5 flex items-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            <h1 className="text-4xl text-foreground md:text-5xl">Relatórios</h1>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Data inicial
                <span className="relative">
                  <input type="date" className="input-shell pr-10 text-sm font-medium uppercase tracking-normal" />
                  <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </span>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Data final
                <span className="relative">
                  <input type="date" className="input-shell pr-10 text-sm font-medium uppercase tracking-normal" />
                  <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button type="button" className="btn-primary px-3.5 py-2">
                <Filter className="h-4 w-4" />
                Filtros
              </button>

            </div>
          </div>
        </section>

        <section data-reports="table" className="surface-panel p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-3xl text-foreground">Tabela de Relatórios</h2>
            <span className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
              1 linha de exemplo
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/80">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-secondary/35 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Sessão</th>
                  <th className="px-4 py-3 font-semibold">Jogo</th>
                  <th className="px-4 py-3 font-semibold">Criada em</th>
                  <th className="px-4 py-3 font-semibold">Participantes</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-border/70 bg-card/35">
                  <td className="px-4 py-3 text-foreground">Sessão de exemplo</td>
                  <td className="px-4 py-3 text-muted-foreground">Betting</td>
                  <td className="px-4 py-3 text-muted-foreground">--/--/----</td>
                  <td className="px-4 py-3 text-foreground">—</td>
                  <td className="px-4 py-3 text-muted-foreground">Sem dado</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                                      <button type="button" className="btn-primary px-3 py-2" aria-label="Exportar registro">
                        <ExternalLink className="h-4 w-4" />
                        Exportar
                      </button>

                      <button type="button" className="btn-secondary px-3 py-2" aria-label="Baixar registro">
                        <Download className="h-4 w-4" />
                        Download
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsDetailsOpen((prev) => !prev)}
                        className="btn-secondary px-2.5 py-2"
                        aria-label="Mais informações"
                        title="Mais informações"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {is_details_open && (
                  <tr className="border-t border-border/70 bg-secondary/25">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="surface-subtle p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Mais informações
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Detalhes indisponíveis no momento. Esta linha existe para demonstrar o comportamento visual dos botões de ação.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
