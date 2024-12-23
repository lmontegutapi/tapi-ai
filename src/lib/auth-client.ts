import { createAuthClient } from "better-auth/react";
import { organizationClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL, // the base url of your auth server
  plugins: [organizationClient(), adminClient()],
});

export const {
	signUp,
	signIn,
	signOut,
	useSession,
	organization,
	useListOrganizations,
	useActiveOrganization,
} = authClient;