import EditorClient from "@/components/editor-client"
import { Suspense } from "react"

export default function EditorPage() {
  return (
    // Use Suspense to handle client component loading
    <Suspense fallback={<div>Loading Editor...</div>}>
      <EditorClient />
    </Suspense>
  )
}
