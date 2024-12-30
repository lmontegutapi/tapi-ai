import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${params.id}`,
      {
        headers: {
          "Xi-Api-Key": process.env.ELEVENLABS_API_KEY!
        }
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch transcript")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching transcript" },
      { status: 500 }
    )
  }
}