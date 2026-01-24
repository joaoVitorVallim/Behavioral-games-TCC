import React from "react"
import { 
  Brain, 
  Search,
  User,
  Play,
  Image as ImageIcon 
} from "lucide-react"

// config jogos
const GAMES = [
  {
    id: 1,
    title: "Jogo 01 - Racismo",
    category: "Condicionamento",
    image: "" 
  },
  {
    id: 2,
    title: "Jogo 02",
    category: "Comportamento",
    image: ""
  },
  {
    id: 3,
    title: "Jogo 03 - Jorge",
    category: "Análise",
    image: ""
  }
]

export function DashboardPage() {
  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #050F25;
        }
      `}</style>

      <div className="min-h-screen w-full bg-[#050F25] text-[#FBFBFC] font-sans flex flex-col overflow-x-hidden">

        {/* HEADER */}
        <header className="w-full h-20 bg-[#050F25] border-b border-[#303D55] sticky top-0 z-50 flex-none">
          <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#122241] rounded-lg border border-[#303D55]">
                <Brain className="w-6 h-6 text-[#58A8F6]" />
              </div>
              <span className="text-lg font-bold tracking-tight">BehaviorLab</span>
            </div>

            <div className="hidden md:flex items-center gap-3 bg-[#122241] px-4 py-2 rounded-full border border-[#303D55] w-96">
              <Search className="w-4 h-4 text-[#4C5D73]" />
              <input 
                placeholder="Buscar sessão..." 
                className="bg-transparent text-sm text-white placeholder-[#4C5D73] focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">Prof. Visitante</p>
                <p className="text-[10px] text-[#B9C2CA]">FHO</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#303D55] border border-[#4C5D73] flex items-center justify-center text-[#58A8F6]">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 w-full py-10 flex flex-col items-center">
          
          <div className="w-full max-w-[1200px] px-6">
            
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-2">Galeria de Sessões</h1>
              <p className="text-[#B9C2CA]">Selecione um experimento</p>
            </div>

            {/* GRID DOS JOGOS */}
            <div className="flex flex-wrap justify-center gap-8 w-full">
              
              {GAMES.map((game) => (
                <div 
                  key={game.id}
                  className="group relative w-72 h-72 bg-[#122241] border border-[#303D55] rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:border-[#58A8F6] transition-all duration-300 shrink-0"
                >
                  <div className="absolute inset-0 bg-[#0c182e] flex items-center justify-center">
                    {game.image !== "" ? (
                      <img 
                        src={game.image} 
                        alt={game.title}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'; 
                          e.currentTarget.parentElement?.classList.add('broken-image-fallback');
                        }}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="flex flex-col items-center opacity-50">
                        <ImageIcon className="w-12 h-12 text-[#4C5D73] mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-[#4C5D73]">Sem Imagem</span>
                      </div>
                    )}
                  </div>

                  {/* Gradiente Escuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050F25] via-transparent to-transparent opacity-90" />

                  {/* Conteúdo */}
                  <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
                    
                    <span className="text-[10px] font-bold tracking-widest text-[#58A8F6] uppercase mb-1">
                      {game.category}
                    </span>

                    <h3 className="text-lg font-bold text-white leading-tight mb-3 group-hover:text-[#58A8F6] transition-colors">
                      {game.title}
                    </h3>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="w-8 h-8 rounded-full bg-[#58A8F6] text-[#050F25] flex items-center justify-center shadow-lg">
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                      </div>
                      <span className="text-xs font-bold text-white">Iniciar</span>
                    </div>
                  </div>

                </div>
              ))}

            </div>
          </div>
        </main>

      </div>
    </>
  )
}