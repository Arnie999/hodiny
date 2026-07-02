import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Clock, Mail, Lock, LogIn, Loader2, UserPlus } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Neplatný email'),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
})

type LoginForm = z.infer<typeof loginSchema>

interface Props {
  onSignIn: () => void
  isSigningIn: boolean
  error: Error | null
  onEmailSignIn: (email: string, password: string) => void
  onEmailSignUp: (email: string, password: string) => void
}

export function LoginPage({ onSignIn, isSigningIn, error, onEmailSignIn, onEmailSignUp }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    if (mode === 'signin') {
      onEmailSignIn(data.email, data.password)
    } else {
      onEmailSignUp(data.email, data.password)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Hodiny</h1>
        <p className="text-neutral-600 mb-8">Sledování pracovní doby</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error.message}
          </div>
        )}

        <button
          onClick={onSignIn}
          disabled={isSigningIn}
          className={`
            w-full flex items-center justify-center gap-3
            px-6 py-3 rounded-xl
            bg-white border-2 border-neutral-200
            hover:bg-neutral-50 hover:border-neutral-300
            transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isSigningIn ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-medium text-neutral-700">Přihlásit se přes Google</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-500">nebo</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-left">
          <div>
            <label className="text-sm text-neutral-600">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                placeholder="tvuj@email.cz"
                {...register('email')}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm text-neutral-600">Heslo</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                placeholder="••••••"
                {...register('password')}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                Přihlásit se
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Zaregistrovat se
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-3 text-sm text-amber-600 hover:underline"
        >
          {mode === 'signin' ? 'Nemáš účet? Zaregistruj se' : 'Už máš účet? Přihlas se'}
        </button>

        <p className="mt-6 text-xs text-neutral-500">
          Přihlášením se synchronizují data mezi všemi tvými zařízeními
        </p>
      </div>
    </div>
  )
}
