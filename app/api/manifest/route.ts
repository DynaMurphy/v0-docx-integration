import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Determine the base URL from the request or Vercel's environment variable
    const host = request.headers.get("host")
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const baseUrl = `https://${host}`

    // Read the manifest template
    const templatePath = path.join(process.cwd(), "public", "manifest.template.xml")
    const template = await fs.readFile(templatePath, "utf-8")

    // Replace the placeholder with the actual deployment URL
    const manifestXml = template.replace(/%%URL%%/g, baseUrl)

    return new NextResponse(manifestXml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    })
  } catch (error) {
    console.error("Error generating manifest:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
