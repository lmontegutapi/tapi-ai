"use client"
import { useState } from "react"
import { useReceivables } from "@/hooks/useReceivables"
import { PaymentHeader } from "@/components/payment/payment-header"
import { PaymentSummary } from "@/components/payment/payment-summary"
import { PaymentMethods } from "@/components/payment/payment-methods"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PaymentTable } from "@/components/payment/payment-table"
import PaymentSkeleton from "@/components/payment/payment-skeleton"

export default function PaymentPage({ params }: { params: { contactId: string } }) {
  const [selectedReceivable, setSelectedReceivable] = useState<any>(null);
  const { data, isLoading } = useReceivables(params.contactId);

  if (isLoading) {
    return <PaymentSkeleton />
  }

  return (
    <>
      <PaymentHeader organization={data?.contact?.organization} />
      
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <PaymentSummary receivables={data?.receivables || []} />
        
        <div className="mt-8 grid grid-cols-12 gap-6">
          <div className={`${selectedReceivable ? 'col-span-8' : 'col-span-12'}`}>
            <PaymentTable 
              receivables={data?.receivables || []}
              selectedReceivable={selectedReceivable}
              onReceivableSelect={setSelectedReceivable}
            />
          </div>

          {selectedReceivable && (
            <div className="col-span-4">
              <PaymentMethods 
                receivable={selectedReceivable}
                organization={data?.contact?.organization}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}