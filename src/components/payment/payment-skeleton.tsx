import { Skeleton } from "@/components/ui/skeleton"

const PaymentHeaderSkeleton = () => {
  return (
    <div className="bg-slate-900 text-white py-8 border-b">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full bg-slate-700" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 bg-slate-700" />
            <Skeleton className="h-4 w-64 bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  )
}

const PaymentSummarySkeleton = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg p-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  )
}

const PaymentTableSkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex gap-4 border-b pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-28" />
          ))}
        </div>
        
        {/* Rows */}
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="flex items-center gap-4 py-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PaymentSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PaymentHeaderSkeleton />
      
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        <PaymentSummarySkeleton />
        
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <PaymentTableSkeleton />
          </div>
          
          <div className="col-span-4">
            <div className="bg-white rounded-lg p-4 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-48" />
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </div>
              
              <Skeleton className="h-px w-full" />
              
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}