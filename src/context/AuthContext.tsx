'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (options: { email: string; password: string }) => Promise<any>
  signUp: (options: { email: string; password: string }) => Promise<any>
  signOut: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// En src/context/AuthContext.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Obtener la sesión actual al cargar
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setUser(data.session?.user || null)
      setLoading(false)
    }
    
    getInitialSession()

    // Configurar listener para cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Estado de autenticación cambiado:", _event, session?.user?.email)
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
      }
    )
    console.log("AuthContext - Usuario:", user?.email, "Cargando:", loading)
    return () => {
      subscription.unsubscribe()
    }
  }, [])


  const value = {
    user,
    session,
    loading,
    signIn: (options: { email: string; password: string }) => 
      supabase.auth.signInWithPassword(options),
    signUp: (options: { email: string; password: string }) => 
      supabase.auth.signUp(options),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}