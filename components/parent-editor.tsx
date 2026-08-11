"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Download,
  Eye,
  FileEdit,
  HardDrive,
  KeyRound,
  Lock,
  LockOpen,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react"
import { DIARY_ENTRIES, type DiaryEntry } from "@/lib/diary"
import { BUILT_IN_QUIZ_ITEMS } from "@/components/cat-quiz"
import {
  BUILT_IN_DIARY_ASSETS,
  CONTENT_OVERRIDE_APPLIED_KEY,
  CONTENT_OVERRIDE_DRAFT_KEY,
  MAX_CONTENT_OVERRIDE_CHARACTERS,
  applyContentOverrideDraft,
  clearAllContentOverrides,
  createEmptyContentOverrides,
  diaryContentOverrideSchema,
  getContentOverrideStorage,
  importContentOverrides,
  quizContentOverrideSchema,
  readContentOverrides,
  saveContentOverrideDraft,
  serializeContentOverrides,
  type ContentOverrides,
  type DiaryContentOverride,
  type QuizContentOverride,
} from "@/lib/content-overrides"
import { assetPath, getLocalDateKey } from "@/lib/utils"
import styles from "@/components/settings-center.module.css"

const PARENT_PIN_KEY = "miyuki-parent-editor-pin-v1"

type EditorTab = "diary" | "quiz"
const EDITOR_TABS: readonly EditorTab[] = ["diary", "quiz"]

export function editorTabForKey(currentTab: EditorTab, key: string): EditorTab | null {
  const currentIndex = EDITOR_TABS.indexOf(currentTab)
  if (key === "ArrowRight") return EDITOR_TABS[(currentIndex + 1) % EDITOR_TABS.length]
  if (key === "ArrowLeft") return EDITOR_TABS[(currentIndex - 1 + EDITOR_TABS.length) % EDITOR_TABS.length]
  if (key === "Home") return EDITOR_TABS[0]
  if (key === "End") return EDITOR_TABS[EDITOR_TABS.length - 1]
  return null
}

type DiaryForm = Omit<DiaryContentOverride, "hidden"> & { hidden: boolean }
type QuizForm = Omit<QuizContentOverride, "correctIndex" | "hidden"> & { correctIndex: string; hidden: boolean }

function createEmptyDiary(): DiaryForm {
  return {
    date: getLocalDateKey(),
    title: "",
    body: "",
    miyukiNote: "",
    illustration: BUILT_IN_DIARY_ASSETS[0],
    alt: "",
    hidden: false,
  }
}

const EMPTY_QUIZ: QuizForm = {
  id: "cat-question-",
  question: "",
  options: ["", "", "", ""],
  correctIndex: "0",
  explanation: "",
  hidden: false,
}

export type ParentEditorProps = {
  onBack?: () => void
}

function zodMessages(error: { issues: Array<{ message: string }> }) {
  return [...new Set(error.issues.map((issue) => issue.message))]
}

async function hashPin(pin: string) {
  const encoded = new TextEncoder().encode(`miyuki-parent-editor:${pin}`)
  const digest = await crypto.subtle.digest("SHA-256", encoded)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function cleanPin(value: string) {
  return value.replace(/\D/g, "").slice(0, 4)
}

type BuiltInDiaryAsset = (typeof BUILT_IN_DIARY_ASSETS)[number]

function isBuiltInDiaryAsset(value: string): value is BuiltInDiaryAsset {
  return BUILT_IN_DIARY_ASSETS.includes(value as BuiltInDiaryAsset)
}

function resolveEditorDiaryAsset(entry: DiaryEntry | DiaryContentOverride): BuiltInDiaryAsset {
  if (isBuiltInDiaryAsset(entry.illustration)) return entry.illustration

  const dedicatedScene = `/content/diary/${entry.date}.webp`
  if (isBuiltInDiaryAsset(dedicatedScene)) return dedicatedScene

  const reusedContentScene = `/content/diary/${entry.illustration}.webp`
  if (isBuiltInDiaryAsset(reusedContentScene)) return reusedContentScene

  const themedScene = `/skins/cream-soda/diary/${entry.illustration}.webp`
  if (isBuiltInDiaryAsset(themedScene)) return themedScene

  const legacyScene = `/images/diary-${entry.illustration}.webp`
  if (isBuiltInDiaryAsset(legacyScene)) return legacyScene

  return "/skins/cream-soda/activity-diary.webp"
}

function diaryFormFromEntry(entry: DiaryEntry | DiaryContentOverride): DiaryForm {
  return {
    date: entry.date,
    title: entry.title,
    body: entry.body,
    miyukiNote: entry.miyukiNote,
    illustration: resolveEditorDiaryAsset(entry),
    alt: entry.alt,
    hidden: "hidden" in entry ? entry.hidden : false,
  }
}

function quizFormFromEntry(entry: QuizContentOverride): QuizForm {
  return { ...entry, correctIndex: String(entry.correctIndex) }
}

function formatUpdatedAt(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "未保存" : date.toLocaleString("ja-JP")
}

export function ParentEditor({ onBack }: ParentEditorProps) {
  const importRef = useRef<HTMLInputElement>(null)
  const pinHeadingRef = useRef<HTMLHeadingElement>(null)
  const editorHeadingRef = useRef<HTMLHeadingElement>(null)
  const wasUnlockedRef = useRef(false)
  const tabRefs = useRef<Record<EditorTab, HTMLButtonElement | null>>({ diary: null, quiz: null })
  const [hasPin, setHasPin] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState("")
  const [pinConfirm, setPinConfirm] = useState("")
  const [tab, setTab] = useState<EditorTab>("diary")
  const [draft, setDraft] = useState<ContentOverrides>(() => createEmptyContentOverrides())
  const [appliedAt, setAppliedAt] = useState<string | null>(null)
  const [diaryForm, setDiaryForm] = useState<DiaryForm>(() => createEmptyDiary())
  const [quizForm, setQuizForm] = useState<QuizForm>(EMPTY_QUIZ)
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [confirmApply, setConfirmApply] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [contentProtectionErrors, setContentProtectionErrors] = useState<string[]>([])

  useEffect(() => {
    const wasUnlocked = wasUnlockedRef.current
    wasUnlockedRef.current = unlocked
    if (!unlocked && !wasUnlocked) return
    window.requestAnimationFrame(() => {
      if (unlocked) editorHeadingRef.current?.focus()
      else pinHeadingRef.current?.focus()
    })
  }, [contentProtectionErrors.length, unlocked])

  useEffect(() => {
    const refresh = () => {
      try {
        const storage = getContentOverrideStorage()
        if (!storage) throw new Error("storage-unavailable")
        setHasPin(Boolean(storage.getItem(PARENT_PIN_KEY)))
        const applied = readContentOverrides(storage, "applied")
        const savedDraft = readContentOverrides(storage, "draft")
        const hasStoredDraft = storage.getItem(CONTENT_OVERRIDE_DRAFT_KEY) !== null
        const preferred = hasStoredDraft && savedDraft.ok
          ? savedDraft.value
          : applied.ok
            ? applied.value
            : createEmptyContentOverrides()
        const protectedErrors = [applied, savedDraft]
          .filter((result) => result.readOnlyProtected)
          .flatMap((result) => result.ok ? [] : result.errors)
        const readErrors = [
          ...(applied.ok ? [] : applied.errors),
          ...(savedDraft.ok ? [] : savedDraft.errors),
        ]
        setDraft(preferred)
        setAppliedAt(applied.ok && (applied.value.diaryEntries.length || applied.value.quizItems.length) ? applied.value.updatedAt : null)
        setContentProtectionErrors([...new Set(protectedErrors)])
        setErrors([...new Set(readErrors)])
      } catch {
        setContentProtectionErrors([])
        setErrors(["この端末の編集内容を読み取れませんでした。ブラウザの保存設定を確認してください。"])
      }
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === CONTENT_OVERRIDE_DRAFT_KEY || event.key === CONTENT_OVERRIDE_APPLIED_KEY) refresh()
    }
    refresh()
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const builtInDiary = useMemo(() => DIARY_ENTRIES, [])
  const sortedDiaryOverrides = useMemo(
    () => [...draft.diaryEntries].sort((a, b) => b.date.localeCompare(a.date)),
    [draft.diaryEntries],
  )

  const showMessage = (value: string) => {
    setErrors([])
    setMessage(value)
  }

  const showErrors = (values: string[]) => {
    setMessage("")
    setErrors(values)
  }

  const selectEditorTab = (nextTab: EditorTab, moveFocus = false) => {
    setTab(nextTab)
    if (moveFocus) window.requestAnimationFrame(() => tabRefs.current[nextTab]?.focus())
  }

  const handleEditorTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentTab: EditorTab) => {
    const nextTab = editorTabForKey(currentTab, event.key)
    if (!nextTab) return
    event.preventDefault()
    selectEditorTab(nextTab, true)
  }

  const setupPin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      showErrors(["PINは数字4けたにしてください。"])
      return
    }
    if (pin !== pinConfirm) {
      showErrors(["2回のPINが同じではありません。"])
      return
    }
    try {
      window.localStorage.setItem(PARENT_PIN_KEY, await hashPin(pin))
      setHasPin(true)
      setUnlocked(true)
      setPin("")
      setPinConfirm("")
      showMessage("誤操作防止PINを設定しました。")
    } catch {
      showErrors(["PINをこの端末に保存できませんでした。"])
    }
  }

  const unlock = async () => {
    if (!/^\d{4}$/.test(pin)) {
      showErrors(["PINを数字4けたで入力してください。"])
      return
    }
    try {
      const saved = window.localStorage.getItem(PARENT_PIN_KEY)
      if (!saved || saved !== await hashPin(pin)) {
        showErrors(["PINがちがいます。もう一度確認してください。"])
        return
      }
      setUnlocked(true)
      setPin("")
      showMessage("編集室をひらきました。")
    } catch {
      showErrors(["PINを確認できませんでした。"])
    }
  }

  const saveDraft = (next: ContentOverrides, confirmation: string) => {
    const storage = getContentOverrideStorage()
    if (!storage) {
      showErrors(["この端末の保存領域を利用できないため、下書きを保存できませんでした。"])
      return false
    }
    const result = saveContentOverrideDraft(storage, next)
    if (!result.ok) {
      if (result.readOnlyProtected) setContentProtectionErrors(result.errors)
      showErrors(result.errors)
      return false
    }
    setDraft(result.value)
    setConfirmApply(false)
    showMessage(confirmation)
    return true
  }

  const saveDiary = () => {
    const parsed = diaryContentOverrideSchema.safeParse(diaryForm)
    if (!parsed.success) {
      showErrors(zodMessages(parsed.error))
      return
    }
    const exists = draft.diaryEntries.some((entry) => entry.date === parsed.data.date)
    const diaryEntries = exists
      ? draft.diaryEntries.map((entry) => entry.date === parsed.data.date ? parsed.data : entry)
      : [...draft.diaryEntries, parsed.data]
    if (saveDraft({ ...draft, diaryEntries }, exists ? "日記の下書きを更新しました。" : "日記を下書きに追加しました。")) {
      setDiaryForm(parsed.data)
    }
  }

  const removeDiaryOverride = (date: string) => {
    saveDraft({ ...draft, diaryEntries: draft.diaryEntries.filter((entry) => entry.date !== date) }, "日記の差分を下書きから削除しました。")
    if (diaryForm.date === date) setDiaryForm(createEmptyDiary())
  }

  const saveQuiz = () => {
    const parsed = quizContentOverrideSchema.safeParse({ ...quizForm, correctIndex: Number(quizForm.correctIndex) })
    if (!parsed.success) {
      showErrors(zodMessages(parsed.error))
      return
    }
    const exists = draft.quizItems.some((entry) => entry.id === parsed.data.id)
    const quizItems = exists
      ? draft.quizItems.map((entry) => entry.id === parsed.data.id ? parsed.data : entry)
      : [...draft.quizItems, parsed.data]
    if (saveDraft({ ...draft, quizItems }, exists ? "クイズの下書きを更新しました。" : "クイズを下書きに追加しました。")) {
      setQuizForm(quizFormFromEntry(parsed.data))
    }
  }

  const removeQuizOverride = (id: string) => {
    saveDraft({ ...draft, quizItems: draft.quizItems.filter((entry) => entry.id !== id) }, "クイズの差分を下書きから削除しました。")
    if (quizForm.id === id) setQuizForm(EMPTY_QUIZ)
  }

  const applyDraft = () => {
    if (!confirmApply) return
    const storage = getContentOverrideStorage()
    if (!storage) {
      showErrors(["この端末の保存領域を利用できないため、下書きを反映できませんでした。"])
      setConfirmApply(false)
      return
    }
    const result = applyContentOverrideDraft(storage, draft)
    if (!result.ok) {
      if (result.readOnlyProtected) setContentProtectionErrors(result.errors)
      showErrors(result.errors)
      return
    }
    setDraft(result.value)
    setAppliedAt(result.value.updatedAt)
    setConfirmApply(false)
    showMessage("下書きをこの端末に反映しました。")
  }

  const downloadContent = () => {
    const result = serializeContentOverrides(draft)
    if (!result.ok) {
      showErrors(result.errors)
      return
    }
    const blob = new Blob([result.value], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `miyuki-content-${getLocalDateKey()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    showMessage("日記とクイズの下書きを書き出しました。PINは入りません。")
  }

  const importContent = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_CONTENT_OVERRIDE_CHARACTERS) {
      showErrors(["ファイルが大きすぎます。500KBまでのJSONを選んでください。"])
      if (importRef.current) importRef.current.value = ""
      return
    }
    try {
      const result = importContentOverrides(await file.text())
      if (!result.ok) {
        showErrors(result.errors)
        return
      }
      saveDraft(result.value, "JSONを下書きとして読み込みました。まだ反映していません。")
    } catch {
      showErrors(["JSONを読み取れませんでした。今の編集内容は変更していません。"])
    } finally {
      if (importRef.current) importRef.current.value = ""
    }
  }

  const resetAll = () => {
    if (!confirmReset) return
    const storage = getContentOverrideStorage()
    if (!storage) {
      showErrors(["この端末の保存領域を利用できないため、編集差分を削除できませんでした。"])
      setConfirmReset(false)
      return
    }
    const result = clearAllContentOverrides(storage)
    if (!result.ok) {
      if (result.readOnlyProtected) setContentProtectionErrors(result.errors)
      showErrors(result.errors)
      setConfirmReset(false)
      return
    }
    setDraft(createEmptyContentOverrides())
    setAppliedAt(null)
    setConfirmReset(false)
    setDiaryForm(createEmptyDiary())
    setQuizForm(EMPTY_QUIZ)
    showMessage("この端末の編集差分をすべて削除し、もとの内容に戻しました。")
  }

  if (!unlocked) {
    return (
      <section className={styles.center} aria-labelledby="parent-lock-title">
        <header className={styles.pageHeader}>
          {onBack ? <button type="button" className={styles.iconButton} onClick={onBack} aria-label="前の画面にもどる"><ChevronLeft aria-hidden="true" /></button> : <span />}
          <div><p><ShieldAlert aria-hidden="true" /> FOR GROWN-UPS</p><h2 ref={pinHeadingRef} tabIndex={-1} id="parent-lock-title">おうちの人の編集室</h2></div>
          <Lock className={styles.headerIcon} aria-hidden="true" />
        </header>
        <div className={styles.localOnly}><HardDrive aria-hidden="true" /><div><strong>変更はこの端末だけ</strong><p>ネットには送信しません。別のスマホやパソコンには自動で反映されません。</p></div></div>
        <section className={`${styles.panel} ${styles.pinPanel}`}>
          <KeyRound aria-hidden="true" />
          <h3>{hasPin ? "4けたPINを入力" : "誤操作防止PINをつくる"}</h3>
          <p>このPINは子どもの誤操作を防ぐためのものです。本人確認や強いセキュリティではありません。</p>
          <label className={styles.pinLabel}>
            <span>{hasPin ? "PIN" : "新しいPIN"}</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(event) => setPin(cleanPin(event.currentTarget.value))}
              onKeyDown={(event) => { if (event.key === "Enter" && hasPin) void unlock() }}
              aria-describedby="pin-help"
            />
          </label>
          {!hasPin ? (
            <label className={styles.pinLabel}>
              <span>もう一度</span>
              <input type="password" inputMode="numeric" autoComplete="off" pattern="[0-9]*" maxLength={4} value={pinConfirm} onChange={(event) => setPinConfirm(cleanPin(event.currentTarget.value))} />
            </label>
          ) : null}
          <small id="pin-help">数字4けた・この端末にだけ保存</small>
          {errors.length ? <div className={styles.error} role="alert"><AlertTriangle aria-hidden="true" />{errors.join(" ")}</div> : null}
          <button type="button" className={styles.primaryButton} onClick={() => void (hasPin ? unlock() : setupPin())}>
            <LockOpen aria-hidden="true" /> {hasPin ? "編集室をひらく" : "PINを設定してひらく"}
          </button>
        </section>
      </section>
    )
  }

  if (contentProtectionErrors.length) {
    return (
      <section className={styles.center} aria-labelledby="parent-protected-title">
        <header className={styles.pageHeader}>
          {onBack ? <button type="button" className={styles.iconButton} onClick={onBack} aria-label="前の画面にもどる"><ChevronLeft aria-hidden="true" /></button> : <span />}
          <div><p><ShieldAlert aria-hidden="true" /> READ-ONLY PROTECTION</p><h2 ref={editorHeadingRef} tabIndex={-1} id="parent-protected-title">編集内容を保護しています</h2></div>
          <button type="button" className={styles.iconButton} onClick={() => { setUnlocked(false); setMessage(""); setErrors([]) }} aria-label="編集室をロックする"><Lock aria-hidden="true" /></button>
        </header>
        <section className={styles.panel} aria-labelledby="protected-content-title">
          <h3 id="protected-content-title"><ShieldAlert aria-hidden="true" /> 新しい保存形式が見つかりました</h3>
          <div className={styles.error} role="alert"><AlertTriangle aria-hidden="true" /><span>{contentProtectionErrors.join(" ")}</span></div>
          <p className={styles.helpText}>この画面では内容を空や破損として扱わず、そのまま端末に残しています。対応する更新版で開くまで、下書きの保存・反映・JSON読み込み・リセットは行えません。</p>
        </section>
      </section>
    )
  }

  return (
    <section className={styles.center} aria-labelledby="parent-title">
      <header className={styles.pageHeader}>
        {onBack ? <button type="button" className={styles.iconButton} onClick={onBack} aria-label="前の画面にもどる"><ChevronLeft aria-hidden="true" /></button> : <span />}
        <div><p><Sparkles aria-hidden="true" /> LOCAL CONTENT STUDIO</p><h2 ref={editorHeadingRef} tabIndex={-1} id="parent-title">おうちの人の編集室</h2></div>
        <button type="button" className={styles.iconButton} onClick={() => { setUnlocked(false); setMessage(""); setErrors([]) }} aria-label="編集室をロックする"><Lock aria-hidden="true" /></button>
      </header>

      <div className={styles.localOnly}><HardDrive aria-hidden="true" /><div><strong>変更はこの端末だけ</strong><p>HTMLや外部画像は使わず、用意された画像だけを選べます。</p></div></div>
      {errors.length ? <div className={styles.error} role="alert"><AlertTriangle aria-hidden="true" />{errors.join(" ")}</div> : null}
      {message ? <div className={styles.success} role="status"><CheckCircle2 aria-hidden="true" />{message}</div> : null}

      <section className={styles.draftBar} aria-label="編集状態">
        <div><strong>下書き</strong><small>最終保存 {formatUpdatedAt(draft.updatedAt)}</small></div>
        <div><strong>反映中</strong><small>{appliedAt ? formatUpdatedAt(appliedAt) : "差分なし"}</small></div>
        <span>{draft.diaryEntries.length} 日記・{draft.quizItems.length} クイズ</span>
      </section>

      <div className={styles.editorTabs} role="tablist" aria-label="編集する内容">
        <button
          ref={(node) => { tabRefs.current.diary = node }}
          id="parent-editor-tab-diary"
          type="button"
          role="tab"
          aria-selected={tab === "diary"}
          aria-controls="parent-editor-panel-diary"
          tabIndex={tab === "diary" ? 0 : -1}
          onClick={() => selectEditorTab("diary")}
          onKeyDown={(event) => handleEditorTabKeyDown(event, "diary")}
        ><BookOpen aria-hidden="true" /> 日記</button>
        <button
          ref={(node) => { tabRefs.current.quiz = node }}
          id="parent-editor-tab-quiz"
          type="button"
          role="tab"
          aria-selected={tab === "quiz"}
          aria-controls="parent-editor-panel-quiz"
          tabIndex={tab === "quiz" ? 0 : -1}
          onClick={() => selectEditorTab("quiz")}
          onKeyDown={(event) => handleEditorTabKeyDown(event, "quiz")}
        ><FileEdit aria-hidden="true" /> クイズ</button>
      </div>

      {tab === "diary" ? (
        <div className={styles.editorLayout} id="parent-editor-panel-diary" role="tabpanel" aria-labelledby="parent-editor-tab-diary">
          <aside className={styles.itemList}>
            <button type="button" className={styles.addButton} onClick={() => setDiaryForm(createEmptyDiary())}><Plus aria-hidden="true" /> 新しい日記</button>
            {sortedDiaryOverrides.length ? <h3>この端末の差分</h3> : null}
            {sortedDiaryOverrides.map((entry) => (
              <button key={entry.date} type="button" data-active={diaryForm.date === entry.date} onClick={() => setDiaryForm(diaryFormFromEntry(entry))}>
                <span>{entry.date}</span><strong>{entry.title}</strong><small>{entry.hidden ? "非表示" : "反映する内容"}</small>
              </button>
            ))}
            <h3>もとの日記</h3>
            {builtInDiary.map((entry) => (
              <button key={entry.date} type="button" data-active={diaryForm.date === entry.date} onClick={() => setDiaryForm(diaryFormFromEntry(entry))}>
                <span>{entry.date}</span><strong>{entry.title}</strong><small>選ぶと差し替え編集</small>
              </button>
            ))}
          </aside>

          <div className={styles.editorForm}>
            <div className={styles.twoColumns}>
              <label><span>日付</span><input type="date" value={diaryForm.date} onChange={(event) => setDiaryForm({ ...diaryForm, date: event.currentTarget.value })} /></label>
              <label><span>タイトル</span><input value={diaryForm.title} maxLength={60} onChange={(event) => setDiaryForm({ ...diaryForm, title: event.currentTarget.value })} /></label>
            </div>
            <label><span>本文</span><textarea value={diaryForm.body} maxLength={1200} rows={7} onChange={(event) => setDiaryForm({ ...diaryForm, body: event.currentTarget.value })} /><small>{diaryForm.body.length} / 1200文字</small></label>
            <label><span>美雪のひとこと</span><textarea value={diaryForm.miyukiNote} maxLength={240} rows={3} onChange={(event) => setDiaryForm({ ...diaryForm, miyukiNote: event.currentTarget.value })} /></label>
            <label><span>組み込み画像</span><select value={diaryForm.illustration} onChange={(event) => setDiaryForm({ ...diaryForm, illustration: event.currentTarget.value as DiaryForm["illustration"] })}>{BUILT_IN_DIARY_ASSETS.map((asset, index) => <option key={asset} value={asset}>画像 {index + 1}・{asset.split("/").at(-1)}</option>)}</select></label>
            <label><span>画像の説明</span><input value={diaryForm.alt} maxLength={160} onChange={(event) => setDiaryForm({ ...diaryForm, alt: event.currentTarget.value })} /><small>見えにくい人にも場面が伝わる短い説明</small></label>
            <label className={styles.confirmRow}><input type="checkbox" checked={diaryForm.hidden} onChange={(event) => setDiaryForm({ ...diaryForm, hidden: event.currentTarget.checked })} /><span>この日付の日記を非表示にする</span></label>
            <article className={styles.contentPreview} aria-label="日記のプレビュー">
              <img src={assetPath(diaryForm.illustration)} alt={diaryForm.alt || "画像説明のプレビュー"} />
              <div><small>{diaryForm.date || "日付"}</small><h3>{diaryForm.title || "タイトル"}</h3><p>{diaryForm.body || "ここに本文の見え方が表示されます。"}</p>{diaryForm.miyukiNote ? <blockquote>美雪より：{diaryForm.miyukiNote}</blockquote> : null}</div>
            </article>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.primaryButton} onClick={saveDiary}><Save aria-hidden="true" /> 下書きに保存</button>
              {draft.diaryEntries.some((entry) => entry.date === diaryForm.date) ? <button type="button" className={styles.ghostButton} onClick={() => removeDiaryOverride(diaryForm.date)}><Trash2 aria-hidden="true" /> 差分を削除</button> : null}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.editorLayout} id="parent-editor-panel-quiz" role="tabpanel" aria-labelledby="parent-editor-tab-quiz">
          <aside className={styles.itemList}>
            <button type="button" className={styles.addButton} onClick={() => setQuizForm({ ...EMPTY_QUIZ, options: [...EMPTY_QUIZ.options] as QuizForm["options"] })}><Plus aria-hidden="true" /> 新しいクイズ</button>
            {draft.quizItems.length ? <h3>この端末のクイズ</h3> : <p>追加したクイズはここに並びます。</p>}
            {draft.quizItems.map((entry) => (
              <button key={entry.id} type="button" data-active={quizForm.id === entry.id} onClick={() => setQuizForm(quizFormFromEntry(entry))}>
                <span>{entry.id}</span><strong>{entry.question}</strong><small>{entry.hidden ? "非表示" : "追加・差し替え"}</small>
              </button>
            ))}
            <h3>もとのクイズ</h3>
            {BUILT_IN_QUIZ_ITEMS.map((entry) => (
              <button key={entry.id} type="button" data-active={quizForm.id === entry.id} onClick={() => setQuizForm(quizFormFromEntry(entry))}>
                <span>{entry.id}</span><strong>{entry.question}</strong><small>選ぶと差し替え・非表示編集</small>
              </button>
            ))}
          </aside>

          <div className={styles.editorForm}>
            <label><span>項目ID</span><input value={quizForm.id} maxLength={49} pattern="[A-Za-z0-9-]+" onChange={(event) => setQuizForm({ ...quizForm, id: event.currentTarget.value })} /><small>英数字とハイフン。既存と同じIDなら差し替えます。</small></label>
            <label><span>もんだい</span><textarea value={quizForm.question} maxLength={160} rows={3} onChange={(event) => setQuizForm({ ...quizForm, question: event.currentTarget.value })} /></label>
            <fieldset className={styles.answerFieldset}>
              <legend>こたえ（正解を1つ選ぶ）</legend>
              {quizForm.options.map((option, index) => (
                <div key={index} className={styles.answerOption}>
                  <input type="radio" name="correct-answer" checked={quizForm.correctIndex === String(index)} onChange={() => setQuizForm({ ...quizForm, correctIndex: String(index) })} aria-label={`こたえ ${index + 1} を正解にする`} />
                  <input value={option} maxLength={80} placeholder={`こたえ ${index + 1}`} aria-label={`こたえ ${index + 1} の内容`} onChange={(event) => { const options = [...quizForm.options] as QuizForm["options"]; options[index] = event.currentTarget.value; setQuizForm({ ...quizForm, options }) }} />
                </div>
              ))}
            </fieldset>
            <label><span>せつめい</span><textarea value={quizForm.explanation} maxLength={240} rows={3} onChange={(event) => setQuizForm({ ...quizForm, explanation: event.currentTarget.value })} /></label>
            <label className={styles.confirmRow}><input type="checkbox" checked={quizForm.hidden} onChange={(event) => setQuizForm({ ...quizForm, hidden: event.currentTarget.checked })} /><span>このIDのクイズを非表示にする</span></label>
            <article className={styles.quizPreview} aria-label="クイズのプレビュー">
              <small>プレビュー</small><h3>{quizForm.question || "ここにもんだいが表示されます"}</h3>
              <ol>{quizForm.options.map((option, index) => <li key={index} data-correct={quizForm.correctIndex === String(index)}>{option || `こたえ ${index + 1}`}</li>)}</ol>
            </article>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.primaryButton} onClick={saveQuiz}><Save aria-hidden="true" /> 下書きに保存</button>
              {draft.quizItems.some((entry) => entry.id === quizForm.id) ? <button type="button" className={styles.ghostButton} onClick={() => removeQuizOverride(quizForm.id)}><Trash2 aria-hidden="true" /> 差分を削除</button> : null}
            </div>
          </div>
        </div>
      )}

      <section className={`${styles.panel} ${styles.publishPanel}`} aria-labelledby="publish-title">
        <div><Eye aria-hidden="true" /><div><h3 id="publish-title">下書きを反映</h3><p>保存しただけでは公開画面は変わりません。件数を確認してから反映してください。</p></div></div>
        <label className={styles.confirmRow}><input type="checkbox" checked={confirmApply} onChange={(event) => setConfirmApply(event.currentTarget.checked)} /><span>日記 {draft.diaryEntries.length}件・クイズ {draft.quizItems.length}件の差分を確認しました</span></label>
        <button type="button" className={styles.primaryButton} disabled={!confirmApply} onClick={applyDraft}><CheckCircle2 aria-hidden="true" /> この端末に反映する</button>
      </section>

      <section className={styles.panel} aria-labelledby="content-backup-title">
        <h3 id="content-backup-title"><Save aria-hidden="true" /> 編集内容の持ち出し</h3>
        <p className={styles.helpText}>日記とクイズの差分だけを書き出します。読み込みはまず下書きになり、すぐには反映されません。</p>
        <div className={styles.buttonRow}>
          <button type="button" className={styles.secondaryButton} onClick={downloadContent}><Download aria-hidden="true" /> 差分を書き出す</button>
          <button type="button" className={styles.secondaryButton} onClick={() => importRef.current?.click()}><Upload aria-hidden="true" /> 差分JSONを読む</button>
          <input ref={importRef} className={styles.hiddenInput} type="file" accept="application/json,.json" tabIndex={-1} aria-hidden="true" onChange={(event) => void importContent(event.currentTarget.files?.[0])} />
        </div>
      </section>

      <section className={`${styles.panel} ${styles.resetPanel}`} aria-labelledby="reset-title">
        <h3 id="reset-title"><RotateCcw aria-hidden="true" /> もとの内容に戻す</h3>
        <p>この端末の日記・クイズ差分だけを削除します。コインやゲーム記録は消えません。</p>
        <label className={styles.confirmRow}><input type="checkbox" checked={confirmReset} onChange={(event) => setConfirmReset(event.currentTarget.checked)} /><span>下書きと反映中の差分がすべて消えることを確認しました</span></label>
        <button type="button" className={styles.dangerButton} disabled={!confirmReset} onClick={resetAll}><Trash2 aria-hidden="true" /> 編集差分をすべて削除</button>
      </section>
    </section>
  )
}
