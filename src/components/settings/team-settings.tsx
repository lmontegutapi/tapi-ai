// components/settings/team-settings.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InviteTeamDialog } from "@/components/settings/invite-team-dialog";
import { Member, User } from "@prisma/client";
interface TeamMember extends Member {
  user: User;
}

export function TeamSettings({ teamMembers }: { teamMembers: TeamMember[] }) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Miembros del equipo</CardTitle>
            <CardDescription>
              Administra los miembros de tu equipo y sus roles
            </CardDescription>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            Invitar miembro
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-2">
                    {/* <Avatar>
                      <AvatarImage src="/placeholder.jpg" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar> */}
                    <span>{member?.user?.name}</span>
                  </TableCell>
                  <TableCell>{member?.user?.email}</TableCell>
                  <TableCell>
                    <Badge>{member.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{member?.user?.banned ? "Bloqueado" : "Activo"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InviteTeamDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}
