export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Login da Plataforma</h1>
        <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-medium transition-colors">
          Entrar no Sistema
        </button>
      </div>
    </div>
  )
}