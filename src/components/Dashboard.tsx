'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    } else if (user) {
        setUserEmail(user.email || null)
        console.log("Dashboard - Usuario:", user?.email, "Cargando:", loading)
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <div className=" bg-blue-600 text-white font-medium rounded hover:bg-blue-700">
        <h2 className="text-xl font-semibold mb-4">Información del usuario</h2>
        <p>Email: {userEmail}</p>
      </div>
      
      {/* Aquí puedes añadir más componentes y funcionalidades */}
    </div>
  )
}