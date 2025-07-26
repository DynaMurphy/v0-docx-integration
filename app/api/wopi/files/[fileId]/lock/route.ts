// This route handles all locking operations.
import { NextResponse } from "next/server"
import { validateWopiToken, getLock, setLock, refreshLock, deleteLock } from "@/lib/wopi-utils"

export async function POST(request: Request, { params }: { params: { fileId: string } }) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("access_token")

  if (!token || !validateWopiToken(token)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const wopiOverride = request.headers.get("X-WOPI-Override")
  const oldLockId = request.headers.get("X-WOPI-OldLock")
  const lockId = request.headers.get("X-WOPI-Lock")
  const currentLock = getLock(params.fileId)

  switch (wopiOverride) {
    case "LOCK":
      if (currentLock) {
        if (currentLock.lockId !== lockId) {
          // Lock mismatch
          return new NextResponse("Lock mismatch", { status: 409, headers: { "X-WOPI-Lock": currentLock.lockId } })
        }
        // If lock IDs match, it's a refresh
        refreshLock(params.fileId, lockId!)
        return new NextResponse(null, { status: 200 })
      }
      // No current lock, create a new one
      setLock(params.fileId, lockId!)
      return new NextResponse(null, { status: 200 })

    case "GET_LOCK":
      if (currentLock) {
        return new NextResponse(null, { status: 200, headers: { "X-WOPI-Lock": currentLock.lockId } })
      }
      return new NextResponse("File not locked", { status: 404 })

    case "REFRESH_LOCK":
      if (!lockId || !refreshLock(params.fileId, lockId)) {
        return new NextResponse("Lock mismatch", { status: 409, headers: { "X-WOPI-Lock": currentLock?.lockId || "" } })
      }
      return new NextResponse(null, { status: 200 })

    case "UNLOCK":
      if (!lockId || !deleteLock(params.fileId, lockId)) {
        return new NextResponse("Lock mismatch", { status: 409, headers: { "X-WOPI-Lock": currentLock?.lockId || "" } })
      }
      return new NextResponse(null, { status: 200 })

    default:
      return new NextResponse("Unsupported operation", { status: 501 })
  }
}
