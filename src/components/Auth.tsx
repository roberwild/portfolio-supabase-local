'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      console.log("Intentando registrar usuario:", email, password) // Para depuración
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      console.log("Respuesta:", data, error) // Para depuración
      
      if (error) throw error
      
      alert('¡Registro exitoso! Verifica tu email para confirmar tu cuenta.')
    } catch (error: any) {
      console.error("Error completo:", error)
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      console.log("Intentando iniciar sesión con:", { email, password: "***" })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log("Respuesta de inicio de sesión:", { data, error })
      
      if (error) throw error
      console.log("Datos de autenticación:", data)
      // Redireccionar al dashboard tras inicio de sesión exitoso
      console.log("Inicio de sesión exitoso, redirigiendo...")
      router.push('/dashboard')
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error)
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Bienvenido</h1>
      <form className="space-y-4">
        <div>
          <input
            className="w-full p-2 border rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            className="w-full p-2 border rounded"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
        <button
          onClick={handleSignIn}
          className="w-full p-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
          <button
            onClick={handleSignUp}
            className="w-full p-2  bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </div>
      </form>
    </div>
  )
}