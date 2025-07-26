"use client"

import type React from "react"

import { MsalProvider } from "@azure/msal-react"
import { PublicClientApplication } from "@azure/msal-browser"
import { msalConfig } from "@/config/msal-config"

const msalInstance = new PublicClientApplication(msalConfig)

export default function MsalProviderComponent({ children }: { children: React.ReactNode }) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>
}
