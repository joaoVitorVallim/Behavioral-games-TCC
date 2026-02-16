import { Header } from '../../../shared/components/Header'
import { FileText, BarChart3, TrendingUp, Users } from 'lucide-react'

export function ReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Relatórios</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Visualize e analise os resultados das sessões experimentais
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:scale-105 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Participantes</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:scale-105 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessões Realizadas</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:scale-105 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-foreground">0%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table Placeholder */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-6">Sessões Recentes</h2>
          
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">Nenhuma sessão encontrada</p>
            <p className="text-muted-foreground text-sm mt-2">
              Crie sua primeira sessão para visualizar relatórios aqui
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
