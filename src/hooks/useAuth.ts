import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseEnabled) {
      setLoading(false)
      return
    }

    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const { session } = data
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabaseEnabled) return { error: null }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    if (!supabaseEnabled) return { error: null }
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    if (!supabaseEnabled) return { error: null }
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const signOutLocal = async () => {
    if (supabaseEnabled) {
      await supabase.auth.signOut({ scope: 'local' })
    }
    setUser(null)
    setSession(null)
    return { error: null }
  }

  const signInWithGoogle = async () => {
    if (!supabaseEnabled) return { error: null }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    return { error }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session?.user,
    signIn,
    signUp,
    signOut,
    signOutLocal,
    signInWithGoogle,
  }
}
