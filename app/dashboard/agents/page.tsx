import { Suspense } from "react"
import { columns } from "@/components/agents/columns"
import { DataTable } from "@/components/agents/table"
import { TableSkeleton } from "@/components/table-skeleton"
import { NewAgentDrawer } from "@/components/agents/new-agent-drawer"
import { getAgents } from "@/actions/agents"
import { EmptyAgents } from "@/components/agents/empty-agents"

export default async function AgentsPage() {
  const agents = await getAgents()

  console.log(agents)
 
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agentes AI</h2>
          <p className="text-muted-foreground">
            Gestiona tus agentes de llamadas automáticas
          </p>
        </div>
        <NewAgentDrawer />
      </div>
      {!agents || agents.length === 0 ? (
        <EmptyAgents />
      ) : (
        <Suspense fallback={<TableSkeleton columnCount={5} rowCount={5} />}>
          <DataTable columns={columns} data={agents} />
        </Suspense>
      )}
    </div>
  )
 }