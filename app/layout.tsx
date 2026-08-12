import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { assetPath } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { PwaManager } from "@/components/pwa-manager"

export const metadata: Metadata = {
  title: "美雪のねこカフェ｜ゲーム・事件記録・猫図鑑",
  description: "6種のゲーム攻略、配色デザイン、猫占い、分岐ストーリー、笑える絵日記を収録した美雪のねこカフェ。",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
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
