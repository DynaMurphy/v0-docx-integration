import type { WopiLock } from "./types"
import jwt from "jsonwebtoken"
import fs from "fs/promises"
import path from "path"

// --- In-memory stores for POC ---
// In production, use a distributed cache like Redis.
const wopiLocks = new Map<string, WopiLock>()
const LOCK_TTL_MS = 30 * 60 * 1000 // 30 minutes

// A secret for signing the WOPI access token. In production, use environment variables.
const WOPI_JWT_SECRET = process.env.WOPI_JWT_SECRET || "a-very-secret-key-for-poc"

/**
 * Generates a short-lived JWT to be used as the WOPI access_token.
 * This token is specific to your WOPI host and is used to authorize WOPI operations.
 * @param fileId The ID of the file being accessed.
 * @param user The user accessing the file.
 * @returns A JWT string.
 */
export function generateWopiToken(fileId: string, user: { name?: string; email?: string }): string {
  const payload = {
    sub: user.email || user.name,
    file_id: fileId,
  }
  return jwt.sign(payload, WOPI_JWT_SECRET, { expiresIn: "1h" })
}

/**
 * Validates the WOPI access_token from the request.
 * @param token The token from the 'Authorization: Bearer' header.
 * @returns The decoded token payload if valid, otherwise null.
 */
export function validateWopiToken(token: string): jwt.JwtPayload | null {
  try {
    // In a real app, you'd also check if the token is revoked, etc.
    const decoded = jwt.verify(token, WOPI_JWT_SECRET)
    if (typeof decoded === "string") {
      return null
    }
    return decoded
  } catch (error) {
    console.error("WOPI token validation failed:", error)
    return null
  }
}

/**
 * Retrieves the full path to the sample document.
 * @returns The file path.
 */
export function getSampleDocxPath(): string {
  // IMPORTANT: Place a 'sample.docx' file in your /public directory.
  return path.join(process.cwd(), "public", "sample.docx")
}

/**
 * Gets the stats of the sample document.
 * @returns File stats from fs.stat.
 */
export async function getSampleDocxStat() {
  try {
    return await fs.stat(getSampleDocxPath())
  } catch (error) {
    console.error("Error reading sample.docx. Make sure the file exists in /public.", error)
    return null
  }
}

// --- Lock Management ---

export function getLock(fileId: string): WopiLock | undefined {
  const lock = wopiLocks.get(fileId)
  if (lock && lock.expires < Date.now()) {
    wopiLocks.delete(fileId)
    return undefined
  }
  return lock
}

export function setLock(fileId: string, lockId: string): WopiLock {
  const newLock: WopiLock = {
    lockId,
    expires: Date.now() + LOCK_TTL_MS,
  }
  wopiLocks.set(fileId, newLock)
  return newLock
}

export function refreshLock(fileId: string, lockId: string): WopiLock | null {
  const existingLock = getLock(fileId)
  if (existingLock && existingLock.lockId === lockId) {
    return setLock(fileId, lockId)
  }
  return null
}

export function deleteLock(fileId: string, lockId: string): boolean {
  const existingLock = getLock(fileId)
  if (existingLock && existingLock.lockId === lockId) {
    return wopiLocks.delete(fileId)
  }
  return false
}
