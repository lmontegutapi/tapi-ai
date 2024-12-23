"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Component() {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		try {
			const res = await authClient.forgetPassword({
				email,
				redirectTo: "/reset-password",
			});
			setIsSubmitted(true);
		} catch (err) {
			setError("Ocurrió un error. Por favor, inténtalo de nuevo.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<main className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
				<Card className="w-[350px]">
					<CardHeader>
						<CardTitle>Revisa tu correo</CardTitle>
						<CardDescription>
							Te hemos enviado un enlace para restablecer tu contraseña a tu correo.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Alert>
							<CheckCircle2 className="h-4 w-4" />
							<AlertDescription>
								Si no ves el correo, revisa tu carpeta de spam.
							</AlertDescription>
						</Alert>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => setIsSubmitted(false)}
						>
							<ArrowLeft className="mr-2 h-4 w-4" /> Volver a restablecer contraseña
						</Button>
					</CardFooter>
				</Card>
			</main>
		);
	}

	return (
		<main className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
			{/* Radial gradient for the container to give a faded look */}
			<div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
			<Card className="w-[350px]">
				<CardHeader>
					<CardTitle>Olvidaste tu contraseña</CardTitle>
					<CardDescription>
						Introduce tu correo electrónico para restablecer tu contraseña
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<div className="grid w-full items-center gap-4">
							<div className="flex flex-col space-y-1.5">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="Introduce tu correo electrónico"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
						</div>
						{error && (
							<Alert variant="destructive" className="mt-4">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<Button
							className="w-full mt-4"
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Enviando..." : "Enviar enlace para restablecer contraseña"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<Link href="/sign-in">
						<Button variant="link" className="px-0">
							Volver a iniciar sesión
						</Button>
					</Link>
				</CardFooter>
			</Card>
		</main>
	);
}