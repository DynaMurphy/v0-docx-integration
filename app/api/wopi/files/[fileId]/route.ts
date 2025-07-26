// This route handles the CheckFileInfo request.
import { NextResponse } from "next/server"
import { validateWopiToken, getSampleDocxStat } from "@/lib/wopi-utils"

export async function GET(request: Request, { params }: { params: { fileId: string } }) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("access_token")

  if (!token || !validateWopiToken(token)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const fileStat = await getSampleDocxStat()
  if (!fileStat) {
    return new NextResponse("File not found", { status: 404 })
  }

  const fileInfo = {
    // Required properties
    BaseFileName: params.fileId,
    OwnerId: "current-user", // Should be a unique user ID
    Size: fileStat.size,
    UserId: "current-user", // Should be a unique user ID
    Version: fileStat.mtime.toISOString(),

    // Host capabilities
    SupportsUpdate: true,
    SupportsLocks: true,
    SupportsGetLock: true,
    SupportsExtendedLockLength: true,

    // User permissions
    UserCanWrite: true,
    UserCanNotWriteRelative: true,

    // UI properties
    SupportsCobalt: true, // Enables modern co-authoring
    SupportsFolders: true,
    SupportsScenarioLinks: true,

    // Add-in support
    // See: https://learn.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/online/scenarios/office-add-ins
    OfficeAddinHost: true,
    // TODO: In production, replace with your actual add-in manifest URL
    OfficeAddinSideloadUrl: `${new URL(request.url).origin}/manifest.xml`,

    // Enable postMessage communication from host to add-in
    // See: https://learn.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/online/scenarios/postmessage
    PostMessageOrigin: new URL(request.url).origin,
  }

  return NextResponse.json(fileInfo)
}
