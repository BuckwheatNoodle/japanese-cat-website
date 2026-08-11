"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Download,
  Eye,
  Gauge,
  HardDrive,
  Music2,
  Palette,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Type,
  Upload,
  Volume2,
} from "lucide-react"
import { useProgression } from "@/components/progression-provider"
import { MAX_BACKUP_CHARACTERS, type AccessibilitySettings } from "@/lib/progression"
import { getLocalDateKey } from "@/lib/utils"
import styles from "@/components/settings-center.module.css"

const SKIN_CHOICES = [
  { id: "season-auto", label: "季節におまかせ", note: "端末の月に合わせて色を選びます" },
  { id: "cream-soda", label: "クリームソーダ", note: "いつものミントとコーラル" },
  { id: "spring-strawberry", label: "春・いちご", note: "桜といちごミルク" },
  { id: "summer-soda", label: "夏・ソーダ", note: "青空としゅわしゅわソーダ" },
  { id: "autumn-caramel", label: "秋・キャラメル", note: "木の実とこっくりキャラメル" },
  { id: "winter-berry", label: "冬・ベリー", note: "雪とあたたかいベリー色" },
] as const

type BackupPreview = {
  raw: string
  filename: string
  version: string
  exportedAt: string
  coins: number | null
  gamesPlayed: number | null
}

export type SettingsCenterProps = {
  onBack?: () => void
  onOpenParentEditor?: () => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function resolveSkinChoice(choice: string, month = new Date().getMonth() + 1) {
  if (choice !== "season-auto") return choice
  if (month >= 3 && month <= 5) return "spring-strawberry"
  if (month >= 6 && month <= 8) return "summer-soda"
  if (month >= 9 && month <= 11) return "autumn-caramel"
  return "winter-berry"
}

function applyDocumentPreferences(settings: AccessibilitySettings) {
  const root = document.documentElement
  root.dataset.miyukiFont = settings.fontSize
  root.dataset.miyukiMotion = settings.reducedMotion ? "reduced" : "full"
  root.dataset.miyukiContrast = settings.highContrast ? "high" : "normal"
  root.dataset.miyukiFurigana = settings.furigana ? "shown" : "hidden"
}

function Toggle({
  checked,
  label,
  note,
  onChange,
}: {
  checked: boolean
  label: string
  note: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={styles.toggleRow}>
      <span>
        <strong>{label}</strong>
        <small>{note}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
      <span className={styles.switchTrack} aria-hidden="true"><span /></span>
    </label>
  )
}

export function SettingsCenter({ onBack, onOpenParentEditor }: SettingsCenterProps) {
  const { state, ready, storageWarnings, updateSettings, exportBackup, importBackup } = useProgression()
  const settings = state.settings
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backupButtonRef = useRef<HTMLButtonElement>(null)
  const backupPreviewHeadingRef = useRef<HTMLHeadingElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [backupPreview, setBackupPreview] = useState<BackupPreview | null>(null)
  const [confirmRestore, setConfirmRestore] = useState(false)

  useEffect(() => {
    if (!ready) return
    applyDocumentPreferences(settings)
  }, [ready, settings])

  useEffect(() => {
    if (!backupPreview) return
    window.requestAnimationFrame(() => backupPreviewHeadingRef.current?.focus({ preventScroll: true }))
  }, [backupPreview])

  const selectedSkin = useMemo(
    () => SKIN_CHOICES.some((choice) => choice.id === settings.skinId) ? settings.skinId : "cream-soda",
    [settings.skinId],
  )

  const changeSettings = (patch: Partial<AccessibilitySettings>, confirmation = "設定を保存しました。") => {
    const result = updateSettings(patch)
    if (!result.ok) {
      setMessage("")
      setError(result.reason === "read-only"
        ? "記録が保護モードのため、設定を変更できません。新しい版のサイトで開き直してください。"
        : "安全に保存できる履歴上限に達したため、設定を変更できません。先にバックアップを書き出してください。")
      return
    }
    const next = { ...settings, ...patch }
    applyDocumentPreferences(next)
    if (patch.skinId) {
      const resolved = resolveSkinChoice(patch.skinId)
      try { window.localStorage.setItem("miyuki-cat-skin", resolved) } catch { /* 進行データ側には保存される */ }
      window.dispatchEvent(new CustomEvent("miyuki:skin-changed", { detail: { choice: patch.skinId, resolved } }))
    }
    setError("")
    setMessage(confirmation)
  }

  const testReadAloud = () => {
    if (!("speechSynthesis" in window)) {
      setError("このブラウザでは読み上げを使えません。")
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance("美雪のねこカフェへ、ようこそ。ゆっくり楽しんでね。")
    utterance.lang = "ja-JP"
    utterance.volume = Math.max(settings.sfxVolume, 0.2)
    window.speechSynthesis.speak(utterance)
    setError("")
    setMessage("読み上げの見本を再生しています。")
  }

  const downloadBackup = () => {
    const content = exportBackup()
    const blob = new Blob([content], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `miyuki-cat-cafe-backup-${getLocalDateKey()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setError("")
    setMessage("バックアップを書き出しました。PINや名前は入りません。")
  }

  const previewBackup = async (file: File | undefined) => {
    setBackupPreview(null)
    setConfirmRestore(false)
    setMessage("")
    if (!file) return
    if (file.size > MAX_BACKUP_CHARACTERS) {
      setError("ファイルが大きすぎます。2MBまでのJSONを選んでください。")
      return
    }
    try {
      const raw = await file.text()
      if (raw.length > MAX_BACKUP_CHARACTERS) throw new Error("too-large")
      const parsed = JSON.parse(raw) as unknown
      if (!isRecord(parsed) || parsed.kind !== "miyuki-cat-cafe-backup" || !isRecord(parsed.state)) {
        throw new Error("wrong-kind")
      }
      const wallet = isRecord(parsed.state.wallet) ? parsed.state.wallet : null
      const stats = isRecord(parsed.state.stats) ? parsed.state.stats : null
      setBackupPreview({
        raw,
        filename: file.name,
        version: String(parsed.formatVersion ?? "不明"),
        exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : "不明",
        coins: wallet ? numberOrNull(wallet.nyanCoins) : null,
        gamesPlayed: stats ? numberOrNull(stats.gamesPlayed) : null,
      })
      setError("")
      setMessage("まだ復元していません。内容を確認してください。")
    } catch {
      setError("このサイトのバックアップJSONを読み取れませんでした。今の記録は変更していません。")
    }
  }

  const restoreBackup = () => {
    if (!backupPreview || !confirmRestore) return
    const result = importBackup(backupPreview.raw)
    if (!result.ok) {
      setError(result.errors.join(" "))
      setMessage("")
      return
    }
    setBackupPreview(null)
    setConfirmRestore(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
    setError("")
    setMessage(result.warnings.length ? `復元しました。${result.warnings.join(" ")}` : "バックアップを復元しました。")
    window.requestAnimationFrame(() => statusRef.current?.focus({ preventScroll: true }))
  }

  const cancelBackupPreview = () => {
    setBackupPreview(null)
    setConfirmRestore(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
    window.requestAnimationFrame(() => backupButtonRef.current?.focus({ preventScroll: true }))
  }

  return (
    <section className={styles.center} aria-labelledby="settings-title" data-font={settings.fontSize} data-contrast={settings.highContrast}>
      <header className={styles.pageHeader}>
        {onBack ? (
          <button type="button" className={styles.iconButton} onClick={onBack} aria-label="前の画面にもどる">
            <ChevronLeft aria-hidden="true" />
          </button>
        ) : <span aria-hidden="true" />}
        <div>
          <p><Sparkles aria-hidden="true" /> COMFORT SETTINGS</p>
          <h2 id="settings-title">みやすさ・あそびやすさ</h2>
        </div>
        <Accessibility className={styles.headerIcon} aria-hidden="true" />
      </header>

      {!ready ? <p className={styles.notice}>設定を読み込んでいます…</p> : null}
      {storageWarnings.length > 0 ? (
        <div className={styles.warning} role="status"><AlertTriangle aria-hidden="true" /><span>{storageWarnings.join(" ")}</span></div>
      ) : null}
      {error ? <div className={styles.error} role="alert"><AlertTriangle aria-hidden="true" />{error}</div> : null}
      {message ? <div ref={statusRef} className={styles.success} role="status" tabIndex={-1}><CheckCircle2 aria-hidden="true" />{message}</div> : null}

      <fieldset className={styles.panel}>
        <legend><Type aria-hidden="true" /> 文字と読み上げ</legend>
        <div className={styles.segmented} aria-label="文字の大きさ">
          {(["small", "normal", "large"] as const).map((size) => (
            <label key={size} data-active={settings.fontSize === size}>
              <input
                type="radio"
                name="font-size"
                value={size}
                checked={settings.fontSize === size}
                onChange={() => changeSettings({ fontSize: size })}
              />
              <span>{size === "small" ? "小さめ" : size === "normal" ? "ふつう" : "大きめ"}</span>
            </label>
          ))}
        </div>
        <Toggle
          checked={settings.readAloud}
          label="読み上げボタン"
          note="日記やものがたりに読み上げボタンを出します"
          onChange={(checked) => changeSettings({ readAloud: checked })}
        />
        <button type="button" className={styles.secondaryButton} onClick={testReadAloud}>
          <Play aria-hidden="true" /> 読み上げをためす
        </button>
      </fieldset>

      <fieldset className={styles.panel}>
        <legend><Eye aria-hidden="true" /> 画面のうごきと色</legend>
        <Toggle
          checked={settings.reducedMotion}
          label="うごきを少なくする"
          note="ふわふわする演出や大きな動きを止めます"
          onChange={(checked) => changeSettings({ reducedMotion: checked })}
        />
        <Toggle
          checked={settings.highContrast}
          label="くっきり表示"
          note="文字と線の色を濃くします"
          onChange={(checked) => changeSettings({ highContrast: checked })}
        />
      </fieldset>

      <fieldset className={styles.panel}>
        <legend><Volume2 aria-hidden="true" /> おと</legend>
        <Toggle
          checked={settings.soundEnabled}
          label="サイトのおと"
          note="BGMと効果音をまとめてオン・オフします"
          onChange={(checked) => changeSettings({ soundEnabled: checked })}
        />
        <label className={styles.rangeRow}>
          <span><Music2 aria-hidden="true" /><strong>BGM</strong><output>{Math.round(settings.bgmVolume * 100)}%</output></span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(settings.bgmVolume * 100)}
            disabled={!settings.soundEnabled}
            onChange={(event) => changeSettings({ bgmVolume: Number(event.currentTarget.value) / 100 }, "BGMの音量を保存しました。")}
          />
        </label>
        <label className={styles.rangeRow}>
          <span><Volume2 aria-hidden="true" /><strong>効果音</strong><output>{Math.round(settings.sfxVolume * 100)}%</output></span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(settings.sfxVolume * 100)}
            disabled={!settings.soundEnabled}
            onChange={(event) => changeSettings({ sfxVolume: Number(event.currentTarget.value) / 100 }, "効果音の音量を保存しました。")}
          />
        </label>
      </fieldset>

      <fieldset className={styles.panel}>
        <legend><Gauge aria-hidden="true" /> ゲームのむずかしさ</legend>
        <div className={styles.choiceGrid}>
          {([
            ["gentle", "ゆっくり", "時間を長めにして遊べます"],
            ["standard", "いつもの", "おすすめのバランスです"],
            ["challenge", "チャレンジ", "すばやく高得点をねらいます"],
          ] as const).map(([value, label, note]) => (
            <label key={value} data-active={settings.difficulty === value}>
              <input
                type="radio"
                name="difficulty"
                checked={settings.difficulty === value}
                onChange={() => changeSettings({ difficulty: value })}
              />
              <strong>{label}</strong><small>{note}</small>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.panel}>
        <legend><Palette aria-hidden="true" /> きせつのデザイン</legend>
        <label className={styles.selectLabel}>
          <span>スキンを選ぶ</span>
          <select value={selectedSkin} onChange={(event) => changeSettings({ skinId: event.currentTarget.value }, "デザインを保存し、全体に反映しました。") }>
            {SKIN_CHOICES.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
          </select>
          <small>{SKIN_CHOICES.find((choice) => choice.id === selectedSkin)?.note}</small>
        </label>
        <div className={styles.skinPreview} data-skin-choice={resolveSkinChoice(selectedSkin)} aria-label="選んだ色の見本">
          <span /><span /><span /><strong>{SKIN_CHOICES.find((choice) => choice.id === selectedSkin)?.label}</strong>
        </div>
      </fieldset>

      <section className={styles.panel} aria-labelledby="backup-title">
        <h3 id="backup-title"><HardDrive aria-hidden="true" /> 記録のバックアップ</h3>
        <p className={styles.helpText}>コイン・ミッション・図鑑・おへや・設定をJSONに保存します。おうちの人用PINと名前は入りません。</p>
        <div className={styles.buttonRow}>
          <button type="button" className={styles.primaryButton} onClick={downloadBackup}>
            <Download aria-hidden="true" /> 書き出す
          </button>
          <button ref={backupButtonRef} type="button" className={styles.secondaryButton} onClick={() => fileInputRef.current?.click()}>
            <Upload aria-hidden="true" /> JSONを選ぶ
          </button>
          <input
            ref={fileInputRef}
            className={styles.hiddenInput}
            type="file"
            accept="application/json,.json"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => void previewBackup(event.currentTarget.files?.[0])}
          />
        </div>

        {backupPreview ? (
          <div className={styles.backupPreview}>
            <h4 ref={backupPreviewHeadingRef} tabIndex={-1}>復元する前の確認</h4>
            <dl>
              <div><dt>ファイル</dt><dd>{backupPreview.filename}</dd></div>
              <div><dt>形式</dt><dd>バージョン {backupPreview.version}</dd></div>
              <div><dt>書き出し日</dt><dd>{backupPreview.exportedAt === "不明" ? "不明" : new Date(backupPreview.exportedAt).toLocaleString("ja-JP")}</dd></div>
              <div><dt>にゃんコイン</dt><dd>{backupPreview.coins ?? "不明"}</dd></div>
              <div><dt>遊んだゲーム</dt><dd>{backupPreview.gamesPlayed ?? "不明"} 回</dd></div>
            </dl>
            <label className={styles.confirmRow}>
              <input type="checkbox" checked={confirmRestore} onChange={(event) => setConfirmRestore(event.currentTarget.checked)} />
              <span>今の記録がこの内容に入れかわることを確認しました</span>
            </label>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.dangerButton} disabled={!confirmRestore} onClick={restoreBackup}>
                <RotateCcw aria-hidden="true" /> この内容を復元
              </button>
              <button type="button" className={styles.ghostButton} onClick={cancelBackupPreview}>
                やめる
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className={`${styles.panel} ${styles.parentLink}`} aria-labelledby="parent-link-title">
        <ShieldCheck aria-hidden="true" />
        <div><h3 id="parent-link-title">おうちの人へ</h3><p>この端末だけの日記・クイズ編集とバックアップができます。</p></div>
        {onOpenParentEditor ? (
          <button type="button" className={styles.secondaryButton} onClick={onOpenParentEditor}>編集室をひらく</button>
        ) : null}
      </section>
    </section>
  )
}
