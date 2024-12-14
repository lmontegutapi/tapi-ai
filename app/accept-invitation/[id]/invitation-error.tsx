import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function InvitationError() {
	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<div className="flex items-center space-x-2">
					<AlertCircle className="w-6 h-6 text-destructive" />
					<CardTitle className="text-xl text-destructive">
						Error de invitación
					</CardTitle>
				</div>
				<CardDescription>
					Hubo un problema con tu invitación.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="mb-4 text-sm text-muted-foreground">
					La invitación que estás intentando acceder es inválida o no tienes los permisos correctos. Por favor, revisa tu correo electrónico para una invitación válida o contacta con el que te la envió.
				</p>
			</CardContent>
			<CardFooter>
				<Link href="/" className="w-full">
					<Button variant="outline" className="w-full">
						Volver a la página principal
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}