"use client"

import { createContext, useContext, ReactNode } from "react"
import { Campaign, Audience } from "@prisma/client"

interface CampaignContextType {
  audiences?: Audience[]
  onSubmit: (data: any) => Promise<void>
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

interface CampaignProviderProps {
  children: ReactNode
  audiences?: Audience[]
  onSubmit: (data: any) => Promise<void>
}

export function CampaignProvider({ children, audiences, onSubmit }: CampaignProviderProps) {
  return (
    <CampaignContext.Provider value={{ audiences, onSubmit }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  const context = useContext(CampaignContext)
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider')
  }
  return context
} 