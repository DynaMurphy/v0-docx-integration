// This route handles GetFile and PutFile requests.
import { NextResponse } from "next/server"
import { validateWopiToken, getSampleDocxPath } from "@/lib/wopi-utils"
import fs from "fs/promises"

// GET /api/wopi/files/[fileId]/contents
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("access_token")

  if (!token || !validateWopiToken(token)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const filePath = getSampleDocxPath()
    const fileBuffer = await fs.readFile(filePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    })
  } catch (error) {
    console.error("Error reading file:", error)
    return new NextResponse("File not found", { status: 404 })
  }
}

// POST /api/wopi/files/[fileId]/contents
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("access_token")

  if (!token || !validateWopiToken(token)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // In a real app, you would validate the lock here using the X-WOPI-Lock header.

  try {
    const fileBuffer = await request.arrayBuffer()

    // For this POC, we won't actually save the file.
    // In a real app, you would write this buffer to your storage (e.g., S3, Blob Storage).
    console.log(`Received file update. Size: ${fileBuffer.byteLength} bytes.`)
    // await fs.writeFile(getSampleDocxPath(), Buffer.from(fileBuffer));

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Error processing file update:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
