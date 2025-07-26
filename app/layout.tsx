import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import MsalProviderComponent from "@/components/msal-provider-component"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Next.js WOPI Host POC",
  description: "Proof-of-concept for WOPI integration with Next.js",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MsalProviderComponent>{children}</MsalProviderComponent>
      </body>
    </html>
  )
}
