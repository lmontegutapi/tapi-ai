import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { OrganizationSettings } from "@/components/settings/organization-settings"
import { TeamSettings } from "@/components/settings/team-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"
/* import { IntegrationSettings } from "@/components/settings/integration-settings"
import { BillingSettings } from "@/components/settings/billing-settings" */
import { getOrganizationSettings, getTeamMembers } from "@/actions/settings"

export default async function SettingsPage() {
  const organization = await getOrganizationSettings()
  const teamMembers = await getTeamMembers()
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Administra la configuración de tu cuenta y organización
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization">Organización</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
{/*           <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger> */}
        </TabsList>
        <TabsContent value="organization">
          {organization?.data && (
            <OrganizationSettings organization={organization.data} />
          )}
        </TabsContent>
        <TabsContent value="team">
          {teamMembers?.data && (
            <TeamSettings teamMembers={teamMembers.data} />
          )}
        </TabsContent>
        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        {/* <TabsContent value="integrations">
          <IntegrationSettings />
        </TabsContent>
        <TabsContent value="billing">
          <BillingSettings />
        </TabsContent> */}
      </Tabs>
    </div>
  )
}