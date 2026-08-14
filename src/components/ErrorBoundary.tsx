import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Něco se pokazilo</h1>
            <p className="text-neutral-600 mb-4">
              V aplikaci došlo při načítání k chybě. Pošli mi prosím následující chybovou zprávu:
            </p>
            <pre className="bg-neutral-100 rounded-lg p-4 text-sm text-left overflow-auto max-h-48 text-neutral-800">
              {this.state.error?.message ?? 'Neznámá chyba'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Načíst znovu
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
