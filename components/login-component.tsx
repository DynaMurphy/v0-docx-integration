"use client"

import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react"
import { loginRequest } from "@/config/msal-config"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginComponent() {
  const { instance } = useMsal()

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error(e)
    })
  }

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: "/",
      mainWindowRedirectUri: "/",
    })
  }

  return (
    <div className="p-4">
      <AuthenticatedTemplate>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/editor">Open Editor</Link>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Button onClick={handleLogin}>Sign in with Microsoft</Button>
      </UnauthenticatedTemplate>
    </div>
  )
}
