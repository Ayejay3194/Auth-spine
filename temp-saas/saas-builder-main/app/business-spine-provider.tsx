'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getBusinessSpineClient, BusinessSpineClient } from '@/lib/business-spine-client'
import { useSession } from 'next-auth/react'

interface BusinessSpineContextType {
  client: BusinessSpineClient | null
  initialized: boolean
  error: Error | null
  loading: boolean
}

const BusinessSpineContext = createContext<BusinessSpineContextType>({
  client: null,
  initialized: false,
  error: null,
  loading: true
})

export function BusinessSpineProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [state, setState] = useState<BusinessSpineContextType>({
    client: null,
    initialized: false,
    error: null,
    loading: true
  })

  useEffect(() => {
    const initializeBusinessSpine = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_BUSINESS_SPINE_URL) {
          throw new Error('Business Spine URL not configured')
        }

        const client = getBusinessSpineClient()
        
        if (process.env.NEXT_PUBLIC_BUSINESS_SPINE_ENABLED !== 'false') {
          await client.initialize()
        }

        setState({
          client,
          initialized: true,
          error: null,
          loading: false
        })
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')
        console.error('Business Spine initialization error:', err)
        
        setState({
          client: null,
          initialized: false,
          error: err,
          loading: false
        })
      }
    }

    if (session || !process.env.NEXT_PUBLIC_BUSINESS_SPINE_ENABLED || process.env.NEXT_PUBLIC_BUSINESS_SPINE_ENABLED !== 'false') {
      initializeBusinessSpine()
    }
  }, [session])

  return (
    <BusinessSpineContext.Provider value={state}>
      {children}
    </BusinessSpineContext.Provider>
  )
}

export function useBusinessSpine() {
  const context = useContext(BusinessSpineContext)
  if (!context) {
    throw new Error('useBusinessSpine must be used within BusinessSpineProvider')
  }
  return context
}
