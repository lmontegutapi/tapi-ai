import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
 
export const session = async () => {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    return session
}