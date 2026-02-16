import { useState } from 'react'
import { Header } from '../../../shared/components/Header'
import { PlusCircle } from 'lucide-react'

export function CreateSessionPage() {
  const [form_data, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    room: '',
    date: '',
    team: '',
    category: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement session creation logic
    console.log('Creating session:', form_data)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...form_data,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PlusCircle className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Criar Nova Sessão</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Preencha os dados para criar uma nova sessão experimental
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form_data.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Ex: Experimento de Tomada de Decisão"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-foreground mb-2">
                Subtítulo *
              </label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={form_data.subtitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Ex: Análise de padrões comportamentais"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                value={form_data.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                placeholder="Descreva os objetivos e metodologia do experimento..."
              />
            </div>

            {/* Room and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="room" className="block text-sm font-medium text-foreground mb-2">
                  Sala *
                </label>
                <input
                  type="text"
                  id="room"
                  name="room"
                  value={form_data.room}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Ex: Lab 203"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={form_data.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Team and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="team" className="block text-sm font-medium text-foreground mb-2">
                  Equipe *
                </label>
                <input
                  type="text"
                  id="team"
                  name="team"
                  value={form_data.team}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Ex: Grupo A"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                  Categoria *
                </label>
                <select
                  id="category"
                  name="category"
                  value={form_data.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="behavioral">Comportamental</option>
                  <option value="cognitive">Cognitivo</option>
                  <option value="social">Social</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-105 transition-all"
              >
                Criar Sessão
              </button>
              <button
                type="reset"
                onClick={() => setFormData({
                  title: '',
                  subtitle: '',
                  description: '',
                  room: '',
                  date: '',
                  team: '',
                  category: ''
                })}
                className="px-8 py-4 bg-card text-foreground border border-border rounded-xl font-semibold hover:scale-105 transition-all"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
