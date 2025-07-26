"use client"

import { useEffect, useState, useRef } from "react"
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react"
import type { AddinMessage } from "@/lib/types"
import { Button } from "@/components/ui/button"

const WORD_EDIT_URL = "https://word-edit.officeapps-df.live.com/we/wordeditorframe.aspx"

export default function EditorClient() {
  const { accounts } = useMsal()
  const [wopiSrc, setWopiSrc] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [messagesFromAddin, setMessagesFromAddin] = useState<AddinMessage[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (accounts.length > 0) {
      const user = accounts[0]
      const fileId = "sample.docx" // For this POC, we use a static file ID.

      // Generate WOPI token via API call
      const generateToken = async () => {
        try {
          const response = await fetch('/api/wopi/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileId,
              user: { name: user.name, email: user.username }
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to generate token')
          }
          
          const { token } = await response.json()
          setAccessToken(token)

          // The WOPISrc is the URL to our WOPI host's CheckFileInfo endpoint.
          const baseUrl = window.location.origin
          const wopiSrcUrl = `${baseUrl}/api/wopi/files/${fileId}`
          setWopiSrc(wopiSrcUrl)
        } catch (error) {
          console.error('Error generating WOPI token:', error)
        }
      }
      
      generateToken()
    }
  }, [accounts])

  // Listener for messages from the add-in
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // IMPORTANT: In production, always validate the origin of the message.
      // if (event.origin !== "https://word-edit.officeapps-df.live.com") return;

      const data = event.data
      if (data && data.type === "ADDIN_MESSAGE") {
        console.log("Message received from add-in:", data.payload)
        setMessagesFromAddin((prev) => [...prev, data])
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const sendMessageToWord = () => {
    if (iframeRef.current?.contentWindow) {
      // This demonstrates sending a message to the Word iframe.
      // For this to be relayed to the add-in, the WOPI host must declare
      // support for the 'PostMessage' capability in CheckFileInfo.
      console.log("Attempting to post message to Word iframe...")
      iframeRef.current.contentWindow.postMessage(
        {
          type: "HOST_MESSAGE",
          payload: { command: "HIGHLIGHT_TEXT", data: "some text" },
        },
        WORD_EDIT_URL,
      )
    }
  }

  return (
    <>
      <UnauthenticatedTemplate>
        <div className="flex h-screen w-screen items-center justify-center">
          <p>Please sign in to view the editor.</p>
        </div>
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <div className="flex flex-col h-screen w-screen">
          <header className="flex h-16 items-center justify-between border-b bg-gray-100/40 px-6">
            <h1 className="font-semibold">Word Editor</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">Welcome, {accounts[0]?.name}</p>
              <Button onClick={sendMessageToWord} variant="outline">
                Send Message to Add-in
              </Button>
            </div>
          </header>
          <main className="flex-1 flex">
            <div className="flex-1">
              {wopiSrc && accessToken ? (
                <iframe
                  ref={iframeRef}
                  src={`${WORD_EDIT_URL}?WOPISrc=${encodeURIComponent(wopiSrc)}&access_token=${encodeURIComponent(accessToken)}`}
                  className="w-full h-full border-0"
                  title="Word Editor"
                />
              ) : (
                <div className="flex items-center justify-center h-full">Loading editor...</div>
              )}
            </div>
            <aside className="w-80 border-l p-4 overflow-y-auto">
              <h2 className="font-semibold mb-2">Events from Add-in</h2>
              <div className="text-xs space-y-2">
                {messagesFromAddin.map((msg, i) => (
                  <pre key={i} className="bg-gray-100 p-2 rounded">
                    {JSON.stringify(msg.payload, null, 2)}
                  </pre>
                ))}
              </div>
            </aside>
          </main>
        </div>
      </AuthenticatedTemplate>
    </>
  )
}
