"use client"

import { useEffect, useRef, useState } from "react"
import { CircleAlert, Download, RefreshCw, Wifi, WifiOff, X } from "lucide-react"

type InstallChoice = {
  outcome: "accepted" | "dismissed"
  platform: string
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<InstallChoice>
}

const NOTICE_VERSION = "v1"
const INSTALL_DISMISS_KEY = `miyuki-pwa-install-dismissed-${NOTICE_VERSION}`
const ONLINE_DISMISS_KEY = `miyuki-pwa-online-dismissed-${NOTICE_VERSION}`
const SW_ERROR_DISMISS_KEY = `miyuki-pwa-sw-error-dismissed-${NOTICE_VERSION}`

function normalizeBasePath(value: string | undefined) {
  if (!value || value === "/") return ""

  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`
  return withLeadingSlash.replace(/\/$/, "")
}

function isAppInstalled() {
  const iosNavigator = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia("(display-mode: standalone)").matches || iosNavigator.standalone === true
}

function getAppleBrowserInfo() {
  const userAgent = navigator.userAgent
  const isTouchMac = (
    navigator.platform === "MacIntel" || /Macintosh/i.test(userAgent)
  ) && navigator.maxTouchPoints > 1
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent) || isTouchMac
  const isSafari = /Safari/i.test(userAgent)
    && /Apple/i.test(navigator.vendor)
    && !/(CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|DuckDuckGo|DdgA|GSA|YaBrowser|Chrome|Chromium)/i.test(userAgent)

  return { isAppleMobile, isSafari }
}

function wasDismissed(key: string) {
  try {
    return window.sessionStorage.getItem(key) === "1"
  } catch {
    return false
  }
}

function rememberDismissal(key: string) {
  try {
    window.sessionStorage.setItem(key, "1")
  } catch {
    // Private browsing or an embedded browser may not expose session storage.
  }
}

export function PwaManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOnlineNotice, setShowOnlineNotice] = useState(false)
  const [updateReady, setUpdateReady] = useState(false)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallHelp, setShowInstallHelp] = useState(false)
  const [isAppleMobile, setIsAppleMobile] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const [installDismissed, setInstallDismissed] = useState(false)
  const [serviceWorkerFailed, setServiceWorkerFailed] = useState(false)
  const [installed, setInstalled] = useState(true)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const refreshingRef = useRef(false)
  const wasOfflineRef = useRef(false)
  const installTriggerRef = useRef<HTMLButtonElement | null>(null)
  const closeHelpRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const initiallyOnline = navigator.onLine
    const browser = getAppleBrowserInfo()
    setIsOnline(initiallyOnline)
    wasOfflineRef.current = !initiallyOnline
    setInstalled(isAppInstalled())
    setIsAppleMobile(browser.isAppleMobile)
    setIsSafari(browser.isSafari)
    setInstallDismissed(wasDismissed(INSTALL_DISMISS_KEY))

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOfflineRef.current && !wasDismissed(ONLINE_DISMISS_KEY)) setShowOnlineNotice(true)
      wasOfflineRef.current = false
    }
    const handleOffline = () => {
      wasOfflineRef.current = true
      setIsOnline(false)
      setShowOnlineNotice(false)
    }
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      setInstalled(false)
    }
    const handleInstalled = () => {
      setInstallEvent(null)
      setInstalled(true)
      setShowInstallHelp(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("beforeinstallprompt", handleInstallPrompt)
    window.addEventListener("appinstalled", handleInstalled)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  useEffect(() => {
    if (!showInstallHelp) return
    closeHelpRef.current?.focus()
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setShowInstallHelp(false)
      window.requestAnimationFrame(() => installTriggerRef.current?.focus())
    }
    window.addEventListener("keydown", closeWithEscape)
    return () => window.removeEventListener("keydown", closeWithEscape)
  }, [showInstallHelp])

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return

    const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)
    let disposed = false
    let observedRegistration: ServiceWorkerRegistration | null = null
    let updateFoundListener: EventListener | null = null
    const workerListeners = new Map<ServiceWorker, EventListener>()

    const unwatchWorker = (worker: ServiceWorker) => {
      const listener = workerListeners.get(worker)
      if (!listener) return
      worker.removeEventListener("statechange", listener)
      workerListeners.delete(worker)
    }

    const watchWorker = (worker: ServiceWorker | null) => {
      if (!worker || workerListeners.has(worker)) return
      const handleStateChange: EventListener = () => {
        if (disposed) return
        if (worker.state === "installed") {
          if (navigator.serviceWorker.controller) setUpdateReady(true)
          unwatchWorker(worker)
        } else if (worker.state === "redundant") {
          unwatchWorker(worker)
        }
      }
      workerListeners.set(worker, handleStateChange)
      worker.addEventListener("statechange", handleStateChange)
      if (worker.state === "installed" || worker.state === "redundant") {
        handleStateChange(new Event("statechange"))
      }
    }

    const observeRegistration = (registration: ServiceWorkerRegistration) => {
      observedRegistration = registration
      const handleUpdateFound: EventListener = () => {
        if (disposed) return
        watchWorker(registration.installing)
      }
      updateFoundListener = handleUpdateFound
      registration.addEventListener("updatefound", handleUpdateFound)
      watchWorker(registration.installing)
    }

    const registerServiceWorker = async () => {
      if (disposed) return
      try {
        const registration = await navigator.serviceWorker.register(`${basePath}/sw.js`, {
          scope: `${basePath}/`,
        })
        if (disposed) return
        registrationRef.current = registration
        setServiceWorkerFailed(false)

        if (registration.waiting && navigator.serviceWorker.controller) setUpdateReady(true)
        observeRegistration(registration)
      } catch (error) {
        if (disposed) return
        console.warn("Service worker registration failed:", error)
        if (!wasDismissed(SW_ERROR_DISMISS_KEY)) setServiceWorkerFailed(true)
      }
    }

    const handleControllerChange = () => {
      if (disposed || refreshingRef.current) return
      refreshingRef.current = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange)

    if (document.readyState === "complete") void registerServiceWorker()
    else window.addEventListener("load", registerServiceWorker, { once: true })

    return () => {
      disposed = true
      window.removeEventListener("load", registerServiceWorker)
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange)
      if (observedRegistration && updateFoundListener) {
        observedRegistration.removeEventListener("updatefound", updateFoundListener)
      }
      workerListeners.forEach((listener, worker) => worker.removeEventListener("statechange", listener))
      workerListeners.clear()
      observedRegistration = null
      updateFoundListener = null
      registrationRef.current = null
    }
  }, [])

  const dismissInstall = () => {
    rememberDismissal(INSTALL_DISMISS_KEY)
    setInstallDismissed(true)
    setShowInstallHelp(false)
  }

  const dismissOnlineNotice = () => {
    rememberDismissal(ONLINE_DISMISS_KEY)
    setShowOnlineNotice(false)
  }

  const dismissServiceWorkerError = () => {
    rememberDismissal(SW_ERROR_DISMISS_KEY)
    setServiceWorkerFailed(false)
  }

  const installApp = async () => {
    if (!installEvent) {
      setShowInstallHelp(true)
      return
    }

    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice
      setInstallEvent(null)
      if (choice.outcome === "accepted") setInstalled(true)
      else dismissInstall()
    } catch (error) {
      console.warn("Install prompt failed:", error)
      setShowInstallHelp(true)
    }
  }

  const applyUpdate = () => {
    const waitingWorker = registrationRef.current?.waiting
    if (!waitingWorker) {
      window.location.reload()
      return
    }

    waitingWorker.postMessage({ type: "SKIP_WAITING" })
  }

  const canOfferInstall = !installed
    && !installDismissed
    && (installEvent !== null || isAppleMobile)

  const closeInstallHelp = () => {
    setShowInstallHelp(false)
    window.requestAnimationFrame(() => installTriggerRef.current?.focus())
  }

  return (
    <div className="pwa-notices">
      {!isOnline && (
        <section className="pwa-notice pwa-notice-offline" role="status" data-testid="offline-notice">
          <span className="pwa-notice-icon" aria-hidden="true"><WifiOff /></span>
          <div>
            <strong>オフラインであそんでいるよ</strong>
            <span>見たことのあるページやゲームは、そのまま楽しめます。</span>
          </div>
        </section>
      )}

      {showOnlineNotice && isOnline && (
        <section className="pwa-notice pwa-notice-online pwa-dismissible" role="status" data-testid="online-notice">
          <span className="pwa-notice-icon" aria-hidden="true"><Wifi /></span>
          <div>
            <strong>オンラインにもどったよ</strong>
            <span>新しい画像や更新を受け取れるようになりました。</span>
          </div>
          <button type="button" className="pwa-dismiss" aria-label="オンライン通知を閉じる" onClick={dismissOnlineNotice}>
            <X aria-hidden="true" />
          </button>
        </section>
      )}

      {updateReady && (
        <section className="pwa-notice pwa-notice-update" role="status" data-testid="update-notice">
          <span className="pwa-notice-icon" aria-hidden="true"><RefreshCw /></span>
          <div>
            <strong>新しいねこカフェが届いたよ</strong>
            <span>今すぐ入れかえて、最新版であそべます。</span>
          </div>
          <button className="pwa-action" type="button" onClick={applyUpdate}>今すぐ更新</button>
        </section>
      )}

      {serviceWorkerFailed && (
        <section className="pwa-notice pwa-notice-warning pwa-dismissible" role="status" data-testid="service-worker-error-notice">
          <span className="pwa-notice-icon" aria-hidden="true"><CircleAlert /></span>
          <div>
            <strong>オフラインの準備を完了できませんでした</strong>
            <span>サイトはそのまま使えます。通信を確認して、次回もう一度試します。</span>
          </div>
          <button type="button" className="pwa-dismiss" aria-label="オフライン準備の通知を閉じる" onClick={dismissServiceWorkerError}>
            <X aria-hidden="true" />
          </button>
        </section>
      )}

      {canOfferInstall && !updateReady && isOnline && (
        <section className="pwa-notice pwa-notice-install pwa-dismissible" data-testid="install-notice">
          <span className="pwa-notice-icon" aria-hidden="true"><Download /></span>
          <div>
            <strong>ホーム画面において遊ぼう</strong>
            <span>アプリみたいに、すぐにねこカフェを開けます。</span>
          </div>
          <button ref={installTriggerRef} className="pwa-action" type="button" onClick={() => void installApp()}>追加する</button>
          <button type="button" className="pwa-dismiss" aria-label="ホーム画面への追加案内を閉じる" onClick={dismissInstall}>
            <X aria-hidden="true" />
          </button>
        </section>
      )}

      {showInstallHelp && (
        <section className="pwa-install-help" role="dialog" aria-labelledby="pwa-install-help-title">
          <button
            ref={closeHelpRef}
            type="button"
            className="pwa-close"
            aria-label="説明を閉じる"
            onClick={closeInstallHelp}
          >
            <X aria-hidden="true" />
          </button>
          <strong id="pwa-install-help-title">ホーム画面への追加方法</strong>
          <p>
            {isSafari
              ? "Safariの共有ボタンを押して、「ホーム画面に追加」を選んでね。"
              : "ブラウザの共有ボタンやメニューを開いて、「ホーム画面に追加」を選んでね。"}
          </p>
        </section>
      )}

      <style jsx>{`
        .pwa-notices {
          position: fixed;
          z-index: 120;
          right: max(12px, env(safe-area-inset-right));
          bottom: calc(82px + env(safe-area-inset-bottom));
          display: grid;
          width: min(430px, calc(100vw - 24px));
          gap: 10px;
          color: #4f3729;
          font-family: inherit;
          pointer-events: none;
        }

        .pwa-notice,
        .pwa-install-help {
          pointer-events: auto;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 11px;
          padding: 12px 13px;
          border: 2px solid rgba(91, 65, 46, 0.2);
          border-radius: 20px;
          background: #fffdf4;
          box-shadow: 0 10px 28px rgba(83, 58, 42, 0.2);
        }

        .pwa-notice { position: relative; }
        .pwa-dismissible { padding-right: 52px; }
        .pwa-notice-offline { background: #fff2c9; }
        .pwa-notice-online,
        .pwa-notice-update { background: #e4f8ed; }
        .pwa-notice-install { background: #fff0f1; }
        .pwa-notice-warning { background: #fff6df; }

        .pwa-notice-icon {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.75);
          color: var(--skin-coral-ink, #8f3441);
        }

        .pwa-notice-icon :global(svg) { width: 23px; height: 23px; }

        .pwa-notice div {
          display: grid;
          gap: 2px;
          min-width: 0;
        }

        .pwa-notice strong,
        .pwa-install-help strong {
          overflow-wrap: anywhere;
          font-size: 0.9rem;
          line-height: 1.35;
        }

        .pwa-notice span:not(.pwa-notice-icon),
        .pwa-install-help p {
          margin: 0;
          overflow-wrap: anywhere;
          font-size: 0.76rem;
          line-height: 1.45;
        }

        button {
          min-height: 44px;
          padding: 8px 13px;
          border: 2px solid #79553f;
          border-radius: 999px;
          background: #fffdf4;
          color: #4f3729;
          font: inherit;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
        }

        button:hover { transform: translateY(-1px); }
        button:focus-visible { outline: 3px solid #8f3045; outline-offset: 3px; }

        .pwa-dismiss,
        .pwa-close {
          display: grid;
          width: 36px;
          min-height: 36px;
          place-items: center;
          padding: 0;
        }

        .pwa-dismiss {
          position: absolute;
          top: 7px;
          right: 7px;
          border-color: transparent;
          background: rgba(255, 255, 255, 0.62);
        }

        .pwa-dismiss :global(svg),
        .pwa-close :global(svg) { width: 18px; height: 18px; }

        .pwa-install-help {
          position: relative;
          grid-template-columns: 1fr;
          padding-right: 48px;
          background: #fffdf4;
        }

        .pwa-close {
          position: absolute;
          top: 7px;
          right: 7px;
        }

        @media (max-width: 520px) {
          .pwa-notices {
            left: max(12px, env(safe-area-inset-left));
            right: max(12px, env(safe-area-inset-right));
            bottom: calc(78px + env(safe-area-inset-bottom));
            width: auto;
          }

          .pwa-notice {
            grid-template-columns: auto minmax(0, 1fr);
          }

          .pwa-notice > .pwa-action {
            grid-column: 1 / -1;
            width: 100%;
          }
        }

        @media (max-width: 360px) {
          .pwa-notices {
            left: max(8px, env(safe-area-inset-left));
            right: max(8px, env(safe-area-inset-right));
            gap: 7px;
          }

          .pwa-notice,
          .pwa-install-help {
            gap: 8px;
            padding: 10px;
            border-radius: 16px;
          }

          .pwa-dismissible,
          .pwa-install-help { padding-right: 44px; }

          .pwa-notice-icon {
            width: 36px;
            height: 36px;
          }

          .pwa-notice-icon :global(svg) { width: 20px; height: 20px; }
          .pwa-notice strong,
          .pwa-install-help strong { font-size: 0.84rem; }
          .pwa-notice span:not(.pwa-notice-icon),
          .pwa-install-help p { font-size: 0.72rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          button:hover { transform: none; }
        }
      `}</style>
    </div>
  )
}
