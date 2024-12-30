import { syncAudienceMembers } from "@/actions/audiences";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await syncAudienceMembers(params.id);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: "Error sincronizando audiencia" },
      { status: 500 }
    );
  }
}