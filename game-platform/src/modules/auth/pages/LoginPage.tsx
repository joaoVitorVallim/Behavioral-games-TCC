import { useState } from "react"
import { GraduationCap, Brain } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { LoginModal } from "../components/LoginModal"

export function LoginPage() {
  const navigate = useNavigate()
  const [show_login_modal, setShowLoginModal] = useState(false)

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
        <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center z-10 bg-background border-b border-border">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 hover:scale-105 transition-transform"
          >
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">BehaviorLab</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:scale-105 hover:text-background transition-all"
            >
              Sou Docente
            </button>
          </div>
        </header>

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

            {/* MAIN CARD */}
            <div className="w-full max-w-[500px] mx-auto bg-card border border-border rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">Área do Aluno</h2>
                  <p className="text-muted-foreground text-sm">
                    Acesse as sessões experimentais disponíveis para sua turma.
                  </p>
                </div>

                <button 
                  onClick={() => navigate('/sessions')}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-105 hover:text-background transition-all"
                >
                  Ver Sessões Disponíveis
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="w-full py-8 text-center opacity-60 hover:opacity-100 transition-opacity bg-background">
          <p className="text-[10px] text-muted-foreground">
            © 2025 BehaviorLab - Todos os direitos reservados.
          </p>
        </footer>
      </div>

      {show_login_modal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  )
}