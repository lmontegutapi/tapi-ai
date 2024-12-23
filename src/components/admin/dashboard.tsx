"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationsList } from "@/components/admin/organizations-list";
import { UsersList } from "@/components/admin/users-list";
import { CreateOrganizationForm } from "@/components/admin/create-organization-form";

export function AdminDashboard() {
  return (
    <Tabs defaultValue="organizations" className="space-y-4">
      <TabsList>
        <TabsTrigger value="organizations">Organizaciones</TabsTrigger>
        <TabsTrigger value="users">Usuarios</TabsTrigger>
        <TabsTrigger value="create">Nueva Organización</TabsTrigger>
      </TabsList>

      <TabsContent value="organizations">
        <Card>
          <CardHeader>
            <CardTitle>Organizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <OrganizationsList />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <UsersList />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Nueva Organización</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateOrganizationForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 