import EditorClient from "@/components/editor-client";
import { Suspense } from "react";

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading Editor...</div>}>
      <EditorClient />
    </Suspense>
  );
}
