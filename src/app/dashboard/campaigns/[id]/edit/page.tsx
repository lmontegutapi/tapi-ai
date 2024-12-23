// app/dashboard/campaigns/[id]/edit/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCampaign } from "@/actions/campaigns";
import { EditCampaignForm } from "@/components/forms/campaign/edit-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default async function EditCampaignPage({
  params
}: {
  params: { id: string }
}) {
  const campaign = await getCampaign(params.id)

  if (!campaign) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Editar Campaña</h2>
        <p className="text-muted-foreground">
          Modifica los parámetros de tu campaña
        </p>
      </div>
      <Separator />
      <Suspense fallback={<FormSkeleton />}>
        <EditCampaignForm campaign={campaign} />
      </Suspense>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}