/**
 * Represents the structure of a WOPI lock.
 * In a real application, this would be stored in a distributed cache like Redis.
 */
export interface WopiLock {
  lockId: string
  expires: number
}

/**
 * Represents a message received from the Office Add-in via postMessage.
 */
export interface AddinMessage {
  type: "ADDIN_MESSAGE"
  payload: {
    command: string
    data?: any
  }
}
