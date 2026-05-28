import type { Metadata } from "next"

import "./globals.css"

import Providers from "./providers"

export const metadata: Metadata = {
  title: "Adhiraj Muduli | Biological Sciences",

  description:
    "Interactive biological sciences portfolio featuring computational biology, molecular systems, and scientific visualization."
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({
  children
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}