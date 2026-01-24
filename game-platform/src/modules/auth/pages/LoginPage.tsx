import React, { useState } from "react"
import { GraduationCap, Brain } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function LoginPage() {

  const navigate = useNavigate()

  const [view, setView] = useState<'landing' | 'login'>('landing')
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !senha) {
      setErro("Preencha todos os campos")
      return
    }
    console.log("Login:", { email, senha })

  }

  return (
    <>
      {/* GLOBAL RESET */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #050F25;
          overflow-x: hidden;
        }
      `}</style>

      {/* APP CONTAINER */}
      <div className="min-h-screen flex flex-col bg-[#050F25] text-[#FBFBFC] font-sans relative selection:bg-[#58A8F6]/30">
        
        {/* BACKGROUND GLOW */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#58A8F6]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* HEADER */}
        <header className="w-full max-w-6xl mx-auto p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#58A8F6]" />
            <span className="text-xl font-bold tracking-tight">BehaviorLab</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('landing')}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all
                ${view === 'landing'
                  ? 'bg-[#58A8F6] border-[#58A8F6] text-[#050F25] shadow-[0_0_12px_rgba(88,168,246,0.35)]'
                  : 'bg-transparent border-[#58A8F6]/50 text-[#58A8F6] hover:bg-[#58A8F6]/10 hover:border-[#58A8F6]'
                }`}
            >
              Sou Aluno
            </button>

            <button
              onClick={() => setView('login')}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all
                ${view === 'login'
                  ? 'bg-[#58A8F6] border-[#58A8F6] text-[#050F25] shadow-[0_0_12px_rgba(88,168,246,0.35)]'
                  : 'bg-transparent border-[#58A8F6]/50 text-[#58A8F6] hover:bg-[#58A8F6]/10 hover:border-[#58A8F6]'
                }`}
            >
              Sou Docente
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 z-10">
          <div className="w-full max-w-4xl text-center space-y-12">

            {/* HERO */}
            <div className={`space-y-8 transition-all duration-500 ${view === 'login' ? 'opacity-40 blur-sm scale-95' : ''}`}>
              <div className="flex justify-center">
                <div className="p-5 bg-[#122241] rounded-2xl border border-[#303D55] shadow-xl">
                  <GraduationCap className="w-10 h-10 text-[#58A8F6]" />
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Desenvolvido em Parceria com a FHO
                </h1>
                <p className="max-w-3xl mx-auto text-[#B9C2CA] text-lg font-light">
                  Esta plataforma foi desenvolvida como TCC em parceria com a{" "}
                  <strong className="text-[#58A8F6] font-medium">
                    Fundação Hermínio Ometto
                  </strong>, unindo tecnologia e educação para inovar no ensino de Análise Comportamental.
                </p>
              </div>
            </div>

            {/* MAIN CARD */}
            <div className="w-full max-w-[500px] mx-auto bg-[#122241] border border-[#303D55] rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#58A8F6]/20 to-transparent" />

              {view === 'landing' ? (
                /* ALUNO */
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold">Área do Aluno</h2>
                    <p className="text-[#B9C2CA] text-sm">
                      Acesse as sessões experimentais disponíveis para sua turma.
                    </p>
                  </div>

                  {/* BOTÃO DE NAVEGAÇÃO PARA DASHBOARD */}
                  <button 
                    onClick={() => navigate('/DashBoard')}
                    className="w-full py-4 bg-[#58A8F6] hover:bg-[#4a96e0] text-[#050F25] rounded-xl font-bold transition-all"
                  >
                    Ver Sessões Disponíveis
                  </button>
                </div>
              ) : (
                /* DOCENTE */
                <form onSubmit={handleSubmit} className="space-y-5 text-left animate-fade-in">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">Login Docente</h2>
                    <p className="text-[#92A0AE] text-xs uppercase tracking-widest mt-1 font-semibold">
                      Área Restrita
                    </p>
                  </div>

                  <input
                    type="email"
                    placeholder="docente@fho.edu.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050F25] border border-[#4C5D73] rounded-xl px-4 py-3 outline-none focus:border-[#58A8F6] transition-colors"
                  />

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full bg-[#050F25] border border-[#4C5D73] rounded-xl px-4 py-3 outline-none focus:border-[#58A8F6] transition-colors"
                  />

                  {erro && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                      {erro}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#58A8F6] hover:bg-[#4a96e0] text-[#050F25] rounded-xl font-bold"
                  >
                    Entrar no Sistema
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="w-full py-8 text-center opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-[#4C5D73]">
            © 2025 BehaviorLab - Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </>
  )
}