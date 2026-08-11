import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { assetPath } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "美雪の猫ページ｜ねこカフェで遊ぼう",
  description: "ゲーム、ぬりえ、占い、絵日記を楽しめる、美雪のかわいい猫ページです。",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className="min-h-screen antialiased"
        style={{ "--cursor-url": `url("${assetPath("/cathand.png")}")` } as React.CSSProperties}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
