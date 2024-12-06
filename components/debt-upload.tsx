'use client'

import { useDebts } from '@/hooks/useDebts'
import UploadModal from './upload-modal'
import DebtTable from './debt-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import LoadingOrb from './loading-orb'
import { useState } from 'react'

const DebtUpload = () => {
  const { data: debts, isLoading } = useDebts()
  const [isLoadingWithTimeout, setIsLoadingWithTimeout] = useState(false)

  if (isLoading && !isLoadingWithTimeout) {
    setIsLoadingWithTimeout(true)
    setTimeout(() => {
      setIsLoadingWithTimeout(false)
    }, 500)
  }

  if (isLoadingWithTimeout) return (
    <div className="w-full flex flex-col items-center justify-center">
      <LoadingOrb />
    </div>
  )
  return (
    <div className="w-full">
      {!debts ? (
        <div className="w-full flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">No hay deudas</h1>
          <p className="text-sm text-muted-foreground">Agrega deudas para empezar</p>
          <Separator className="my-4" />
          <UploadModal borderCard={false} />
        </div>
      ) : (
        <div className="w-full">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold">Deudas</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Agregar deudas</Button>
              </DialogTrigger>
              <DialogContent>
                <UploadModal />
              </DialogContent>
            </Dialog>
          </div>
          <Separator className="my-4" />
          <DebtTable debts={debts} />
        </div>
      )}
    </div>
  )
}

export default DebtUpload