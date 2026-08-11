import type { MetadataRoute } from "next"

export const dynamic = "force-static"

function normalizeBasePath(value: string | undefined) {
  if (!value || value === "/") return ""

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`
  return withLeadingSlash.replace(/\/$/, "")
}

export default function manifest(): MetadataRoute.Manifest {
  const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)
  const fromRoot = (path: string) => `${basePath}${path}`
  const appRoot = `${basePath}/`

  return {
    id: appRoot,
    name: "美雪のねこカフェ",
    short_name: "美雪ねこカフェ",
    description: "ゲーム攻略、カラー設計、猫占い、分岐ストーリー、絵日記を収録した美雪のねこカフェです。",
    start_url: `${appRoot}#home`,
    scope: appRoot,
    display: "standalone",
    background_color: "#fff9e9",
    theme_color: "#8bcbb2",
    orientation: "portrait-primary",
    lang: "ja",
    dir: "ltr",
    categories: ["education", "games", "kids"],
    icons: [
      {
        src: fromRoot("/pwa/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: fromRoot("/pwa/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: fromRoot("/pwa/icon-maskable-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: fromRoot("/pwa/icon-maskable-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "ホーム",
        short_name: "ホーム",
        description: "ねこカフェのホームへ",
        url: `${appRoot}#home`,
        icons: [{ src: fromRoot("/pwa/shortcut-home-96.png"), sizes: "96x96", type: "image/png" }],
      },
      {
        name: "ゲーム",
        short_name: "ゲーム",
        description: "ねこのゲームで遊ぶ",
        url: `${appRoot}#games`,
        icons: [{ src: fromRoot("/pwa/shortcut-games-96.png"), sizes: "96x96", type: "image/png" }],
      },
      {
        name: "ぬりえ",
        short_name: "ぬりえ",
        description: "ねこのぬりえで遊ぶ",
        url: `${appRoot}#coloring`,
        icons: [{ src: fromRoot("/pwa/shortcut-coloring-96.png"), sizes: "96x96", type: "image/png" }],
      },
      {
        name: "ねこ占い",
        short_name: "占い",
        description: "今日のねこ占いを見る",
        url: `${appRoot}#fortune`,
        icons: [{ src: fromRoot("/pwa/shortcut-fortune-96.png"), sizes: "96x96", type: "image/png" }],
      },
      {
        name: "絵日記",
        short_name: "絵日記",
        description: "美雪の絵日記を読む",
        url: `${appRoot}#diary`,
        icons: [{ src: fromRoot("/pwa/shortcut-diary-96.png"), sizes: "96x96", type: "image/png" }],
      },
    ],
  }
}
