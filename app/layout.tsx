import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { assetPath } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { PwaManager } from "@/components/pwa-manager"

export const metadata: Metadata = {
  title: "美雪の猫ページ｜ねこカフェで遊ぼう",
  description: "ゲーム、ぬりえ、占い、絵日記を楽しめる、美雪のかわいい猫ページです。",
  generator: "Next.js",
  manifest: assetPath("/manifest.webmanifest"),
  appleWebApp: { capable: true, title: "美雪ねこカフェ", statusBarStyle: "default" },
  icons: { apple: assetPath("/pwa/apple-touch-icon.png") },
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
        <PwaManager />
        <Toaster />
      </body>
    </html>
  )
}
