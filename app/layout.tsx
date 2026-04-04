import type React from "react"
import type { Metadata } from "next"
import { M_PLUS_Rounded_1c } from "next/font/google"
import "./globals.css"
import { cn, assetPath } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

const fontRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "美雪の猫ページ",
  description: "猫のゲームと絵日記がある、かわいくて楽しいホームページです。",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body
        className={cn("min-h-screen bg-background font-sans antialiased", fontRounded.variable)}
        style={{ "--cursor-url": `url("${assetPath("/cathand.png")}")` } as React.CSSProperties}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
