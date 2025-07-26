import { NextRequest, NextResponse } from "next/server"
import { generateWopiToken } from "@/lib/wopi-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId, user } = body

    if (!fileId || !user) {
      return NextResponse.json(
        { error: "fileId and user are required" },
        { status: 400 }
      )
    }

    const token = generateWopiToken(fileId, user)

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating WOPI token:", error)
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    )
  }
}
