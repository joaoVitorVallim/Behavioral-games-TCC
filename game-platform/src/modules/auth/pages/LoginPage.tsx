import { GraduationCap } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Header } from "../../../shared/components/Header"

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <>
      {/* GLOBAL RESET */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
      `}</style>

      {/* APP CONTAINER */}
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans relative">

        {/* HEADER */}
        <Header />

        {/* MAIN */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 z-10 bg-background">
          <div className="w-full max-w-4xl text-center space-y-12">

            {/* HERO */}
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="p-5 bg-card rounded-2xl border border-border shadow-xl">
                  <GraduationCap className="w-10 h-10 text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Desenvolvido em Parceria com a FHO
                </h1>
                <p className="max-w-3xl mx-auto text-muted-foreground text-lg font-light">
                  Esta plataforma foi desenvolvida como TCC em parceria com a{" "}
                  <strong className="text-primary font-medium">
                    Fundação Hermínio Ometto
                  </strong>, unindo tecnologia e educação para inovar no ensino de Análise Comportamental.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate('/sessions')}
              className="w-full max-w-[500px] mx-auto py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-105 hover:text-background transition-all block"
            >
              Ver Sessões Disponíveis
            </button>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="w-full py-8 text-center opacity-60 hover:opacity-100 transition-opacity bg-background">
          <p className="text-[10px] text-muted-foreground">
            © 2025 BehaviorLab - Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </>
  )
}