import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { GraduationCap, FlaskConical, ArrowRight } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { Header } from "../../../shared/components/Header"

export function LoginPage() {
  const navigate = useNavigate()
  const root_ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!root_ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-intro="kicker"], [data-intro="title"], [data-intro="text"], [data-intro="cta"], [data-intro="meta"]',
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.1
        }
      )
    }, root_ref)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root_ref} className="app-shell flex flex-col text-foreground">
        <Header />

      <main className="relative z-10 flex flex-1 items-center px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.85fr] lg:items-center">
          <section className="surface-panel p-7 md:p-10 lg:p-12">
            <p data-intro="kicker" className="heading-kicker mb-4">Plataforma oficial de experimentacao</p>
            <h1 data-intro="title" className="max-w-3xl text-4xl leading-tight text-foreground md:text-5xl">
              Pesquisa comportamental com experiencia profissional, estavel e orientada por dados.
            </h1>
            <p data-intro="text" className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Esta plataforma foi desenvolvida em parceria com a Fundacao Herminio Ometto para apoiar atividades academicas em Analise Comportamental com fluxo seguro para docentes e participantes.
            </p>

            <div data-intro="cta" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => navigate('/sessions')}
                className="btn-primary w-full sm:w-auto"
              >
                Ver sessoes disponiveis
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="surface-subtle flex items-center gap-3 px-4 py-3">
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <p className="text-sm text-muted-foreground">Ambiente validado para uso em sala e laboratorio.</p>
              </div>
            </div>
          </section>

          <aside data-intro="meta" className="surface-panel p-7 md:p-9">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl border border-primary/35 bg-primary/10 p-3 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="heading-kicker mb-1">Institucional</p>
                <h2 className="text-2xl leading-tight text-foreground">Desenvolvido em parceria com a FHO</h2>
              </div>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="surface-subtle p-4">
                <p className="heading-kicker mb-2">Foco</p>
                <p>Engajar estudantes com dinâmicas gamificadas sem perder rigor academico.</p>
              </div>
              <div className="surface-subtle p-4">
                <p className="heading-kicker mb-2">Contexto</p>
                <p>Uso docente com controle de sessao, configuracoes customizadas e entrada monitorada.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-border/70 bg-background/65 px-4 py-5 text-center backdrop-blur-sm">
        <p className="text-[11px] tracking-[0.13em] text-muted-foreground">© 2025 BehaviorLab - Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
