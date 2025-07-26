// This route handles the CheckFileInfo request.
import { NextResponse } from "next/server"
import { validateWopiToken, getSampleDocxStat } from "@/lib/wopi-utils"

// Utility: log request details for diagnostics
function logWopiRequest(context: {
  url: string;
  method: string;
  headers: Headers;
  params: any;
}) {
  // Log the full request URL, method, headers, and params
  console.log("[WOPI] Incoming request:", {
    url: context.url,
    method: context.method,
    headers: Object.fromEntries(context.headers.entries()),
    params: context.params,
  });
}

// Utility: check for double-encoding or malformed WOPISrc
function isMalformedWopiSrc(wopiSrc: string | null): boolean {
  if (!wopiSrc) return false;
  try {
    // If decoding twice changes the value, it's double-encoded
    return decodeURIComponent(wopiSrc) !== wopiSrc &&
      decodeURIComponent(decodeURIComponent(wopiSrc)) === decodeURIComponent(wopiSrc);
  } catch {
    return true;
  }
}

// Middleware: log if route is hit, and catch 404/400
function logRouteHit(route: string, status: number) {
  console.log(`[WOPI] Route hit: ${route}, status: ${status}`);
}

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { fileId: string } }) {
  logWopiRequest({
    url: request.url,
    method: "GET",
    headers: request.headers,
    params,
  });

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("access_token");
  const wopiSrc = searchParams.get("WOPISrc");

  // Log and validate WOPISrc encoding
  if (isMalformedWopiSrc(wopiSrc)) {
    logRouteHit("CheckFileInfo", 400);
    return new NextResponse("Malformed WOPISrc", { status: 400 });
  }

  // Log host header for Azure Front Door/custom domain debugging
  const hostHeader = request.headers.get("host");
  if (hostHeader) {
    console.log(`[WOPI] Host header: ${hostHeader}`);
  }

  // Token validation
  if (!token) {
    logRouteHit("CheckFileInfo", 400);
    console.error("[WOPI] Missing access_token");
    return new NextResponse("Missing access_token", { status: 400 });
  }
  if (!validateWopiToken(token)) {
    logRouteHit("CheckFileInfo", 401);
    console.error("[WOPI] Invalid access_token");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // File stat
  const fileStat = await getSampleDocxStat();
  if (!fileStat) {
    logRouteHit("CheckFileInfo", 404);
    return new NextResponse("File not found", { status: 404 });
  }

  // Compose WOPI response
  const fileInfo = {
    BaseFileName: params.fileId,
    OwnerId: "current-user", // Should be a unique user ID
    Size: fileStat.size,
    UserId: "current-user", // Should be a unique user ID
    Version: fileStat.mtime.toISOString(),
    SupportsUpdate: true,
    SupportsLocks: true,
    SupportsComments: true,
    SupportsGetLock: true,
    SupportsExtendedLockLength: true,
    UserCanWrite: true,
    UserCanNotWriteRelative: true,
    SupportsCobalt: true,
    SupportsFolders: true,
    SupportsScenarioLinks: true,
    OfficeAddinHost: true,
    OfficeAddinSideloadUrl: `${new URL(request.url).origin}/api/manifest`,
    PostMessageOrigin: new URL(request.url).origin,
  };

  // Add X-WOPI-ItemVersion header
  const res = NextResponse.json(fileInfo);
  res.headers.set("X-WOPI-ItemVersion", fileStat.mtime.toISOString());
  logRouteHit("CheckFileInfo", 200);
  return res;
}
