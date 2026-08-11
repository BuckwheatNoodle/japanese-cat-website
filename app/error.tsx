"use client"

import { useEffect } from "react"
import { CircleAlert, Home, RotateCcw } from "lucide-react"
import { assetPath } from "@/lib/utils"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Miyuki cat cafe screen error", error)
  }, [error])

  return (
    <main id="main-content" className="main-stage error-boundary" tabIndex={-1}>
      <section className="error-boundary-card" role="alert" aria-labelledby="error-boundary-title">
        <CircleAlert aria-hidden="true" />
        <p className="screen-kicker">CAT CAFE HELP DESK</p>
        <h1 id="error-boundary-title">画面をひらけませんでした</h1>
        <p>記録は消していません。もう一度読み込むか、ホームへ戻ってやり直してください。</p>
        <div>
          <button type="button" className="primary-action" onClick={reset}>
            <RotateCcw aria-hidden="true" /> もう一度ためす
          </button>
          <a className="secondary-action" href={`${assetPath("/")}#home`}>
            <Home aria-hidden="true" /> ホームへ戻る
          </a>
        </div>
      </section>
    </main>
  )
}
