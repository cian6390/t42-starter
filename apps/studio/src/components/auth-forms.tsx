'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@t42/ui/components/button'
import { Input } from '@t42/ui/components/input'
import {
  type SignInInput,
  type SignUpInput,
  signInSchema,
  signUpSchema
} from '@t42/validators'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authClient } from '@/lib/auth-client'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthForms() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('sign-in')

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema)
  })

  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema)
  })

  const onSignIn = signInForm.handleSubmit(async (data) => {
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password
    })

    if (result.error) {
      signInForm.setError('root', { message: result.error.message })
      return
    }

    router.push('/board')
    router.refresh()
  })

  const onSignUp = signUpForm.handleSubmit(async (data) => {
    const result = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name
    })

    if (result.error) {
      signUpForm.setError('root', { message: result.error.message })
      return
    }

    router.push('/board')
    router.refresh()
  })

  return (
    <div className="rounded-lg border border-border p-6">
      <div className="mb-6 flex gap-4 border-b border-border pb-4 text-sm">
        <button
          type="button"
          className={
            mode === 'sign-in'
              ? 'font-medium text-foreground'
              : 'text-muted-foreground'
          }
          onClick={() => setMode('sign-in')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={
            mode === 'sign-up'
              ? 'font-medium text-foreground'
              : 'text-muted-foreground'
          }
          onClick={() => setMode('sign-up')}
        >
          Sign up
        </button>
      </div>

      {mode === 'sign-in' ? (
        <form onSubmit={onSignIn} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              {...signInForm.register('email')}
            />
            {signInForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {signInForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              {...signInForm.register('password')}
            />
            {signInForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {signInForm.formState.errors.password.message}
              </p>
            )}
          </div>
          {signInForm.formState.errors.root && (
            <p className="text-sm text-destructive">
              {signInForm.formState.errors.root.message}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={signInForm.formState.isSubmitting}
          >
            Sign in
          </Button>
        </form>
      ) : (
        <form onSubmit={onSignUp} className="space-y-4">
          <div className="space-y-2">
            <Input placeholder="Name" {...signUpForm.register('name')} />
            {signUpForm.formState.errors.name && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              {...signUpForm.register('email')}
            />
            {signUpForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              {...signUpForm.register('password')}
            />
            {signUpForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.password.message}
              </p>
            )}
          </div>
          {signUpForm.formState.errors.root && (
            <p className="text-sm text-destructive">
              {signUpForm.formState.errors.root.message}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={signUpForm.formState.isSubmitting}
          >
            Create account
          </Button>
        </form>
      )}
    </div>
  )
}
