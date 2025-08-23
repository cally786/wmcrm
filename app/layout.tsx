import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import DevLogger from "./dev-logger"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Wingman CRM",
  description: "CRM para gestión de comerciales freelance, bares y comisiones",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <DevLogger />
        {children}
      </body>
    </html>
  )
}
