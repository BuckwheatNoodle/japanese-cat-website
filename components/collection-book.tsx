"use client"

import { useMemo, useRef, useState } from "react"
import { ArrowLeft, BookOpen, Check, LockKeyhole, Sparkles } from "lucide-react"
import { ExperienceArtwork } from "@/components/experience-artwork"
import styles from "@/components/experience.module.css"

export type CollectionDefinition = {
  id: string
  kind: "cat"
  name: string
  subtitle: string
  description: string
  hint: string
  artSrc: string
  rarity: 1 | 2 | 3
}

export type CollectionBookProps = {
  unlockedIds: readonly string[]
  newIds?: readonly string[]
  entries?: readonly CollectionDefinition[]
  onOpenEntry?: (entryId: string) => void
  onBack?: () => void
}

export const COLLECTION_CATALOG: readonly CollectionDefinition[] = [
  {
    id: "cat-maron",
    kind: "cat",
    name: "トラちゃん",
    subtitle: "元気な茶トラ",
    description: "しましましっぽが自慢。遊びを見つけると、三匹の先頭で駆けていきます。",
    hint: "猫カフェのホームを見てみよう",
    artSrc: "/content/collections/cats/maron.webp",
    rarity: 1,
  },
  {
    id: "cat-kuro",
    kind: "cat",
    name: "キキ",
    subtitle: "静かな黒猫",
    description: "暗い場所でも目がきらり。なくしものを見つけるのが得意です。",
    hint: "神経衰弱で遊んでみよう",
    artSrc: "/content/collections/cats/kuro.webp",
    rarity: 2,
  },
  {
    id: "cat-yuki",
    kind: "cat",
    name: "フワ",
    subtitle: "ふわふわの白猫",
    description: "白くてやわらかな毛が自慢。窓辺でのんびり過ごすのが好きです。",
    hint: "ねこ占いをしてみよう",
    artSrc: "/content/collections/cats/yuki.webp",
    rarity: 1,
  },
]

export function CollectionBook({
  unlockedIds,
  newIds = [],
  entries = COLLECTION_CATALOG,
  onOpenEntry,
  onBack,
}: CollectionBookProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const detailRef = useRef<HTMLElement | null>(null)
  const unlocked = useMemo(() => new Set(unlockedIds), [unlockedIds])
  const fresh = useMemo(() => new Set(newIds), [newIds])
  const selectedEntry = entries.find((entry) => entry.id === selectedId)
  const discoveredCount = entries.filter((entry) => unlocked.has(entry.id)).length

  const selectEntry = (entryId: string) => {
    setSelectedId(entryId)
    onOpenEntry?.(entryId)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const detail = detailRef.current
        if (!detail) return
        const reducedMotion = document.documentElement.dataset.miyukiMotion === "reduced"
          || window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const isLongJump = Math.abs(detail.getBoundingClientRect().top) > window.innerHeight * 1.5
        detail.scrollIntoView({ behavior: reducedMotion || isLongJump ? "auto" : "smooth", block: "start" })
        detail.focus({ preventScroll: true })
      })
    })
  }

  return (
    <section className={styles.experienceScreen} aria-labelledby="collection-title">
      <div className={styles.screenToolbar}>
        {onBack && (
          <button type="button" className={styles.backButton} onClick={onBack}>
            <ArrowLeft aria-hidden="true" /> 猫クラブへ
          </button>
        )}
        <span className={styles.collectionCount}><BookOpen aria-hidden="true" /><strong>{discoveredCount}</strong> / {entries.length}</span>
      </div>

      <header className={styles.compactHeader}>
        <p className={styles.kicker}><Sparkles aria-hidden="true" /> CAT COLLECTION BOOK</p>
        <h2 id="collection-title">いつもの三匹図鑑</h2>
        <p>トラちゃん、キキ、フワの紹介と発見記録を確認できます。</p>
      </header>

      <ExperienceArtwork
        src="/content/collections/cat-book-three-cats.webp"
        alt="図鑑を開く美雪と、トラちゃん、キキ、フワ"
        className={styles.adventureHeroArt}
        fit="cover"
      />

      <div className={styles.collectionLayout}>
        <div className={styles.collectionGrid} aria-label="三匹の図鑑カード">
          {entries.map((entry, index) => {
            const isUnlocked = unlocked.has(entry.id)
            const isSelected = selectedId === entry.id
            const collectionNumber = `No.${String(index + 1).padStart(2, "0")}`
            return (
              <button
                key={entry.id}
                type="button"
                className={styles.collectionCard}
                data-locked={!isUnlocked || undefined}
                data-selected={isSelected || undefined}
                aria-controls="collection-detail"
                aria-expanded={isSelected}
                aria-label={isUnlocked
                  ? `図鑑${collectionNumber}、${entry.name}。${entry.subtitle}`
                  : `図鑑${collectionNumber}、まだ見つけていないページ。ヒントを見る`}
                onClick={() => selectEntry(entry.id)}
              >
                <span className={styles.collectionNumber}>{collectionNumber}</span>
                {fresh.has(entry.id) && isUnlocked && <span className={styles.newBadge}>NEW</span>}
                <ExperienceArtwork
                  src={entry.artSrc}
                  alt={isUnlocked ? `${entry.name}の図鑑イラスト` : "まだ見つけていない猫のシルエット"}
                  className={styles.collectionArt}
                />
                <span className={styles.collectionCardCopy}>
                  {isUnlocked ? (
                    <><strong>{entry.name}</strong><small>{entry.subtitle}</small></>
                  ) : (
                    <><strong>？？？</strong><small><LockKeyhole aria-hidden="true" /> ヒントあり</small></>
                  )}
                </span>
                <span className={styles.rarityStars} aria-label={`レア度 ${entry.rarity}`}>
                  {Array.from({ length: 3 }, (_, starIndex) => <Sparkles key={starIndex} aria-hidden="true" data-on={starIndex < entry.rarity || undefined} />)}
                </span>
              </button>
            )
          })}
        </div>

        <aside
          ref={detailRef}
          id="collection-detail"
          className={styles.collectionDetail}
          tabIndex={-1}
          aria-labelledby="collection-detail-title"
        >
          {selectedEntry ? (
            unlocked.has(selectedEntry.id) ? (
              <>
                <ExperienceArtwork src={selectedEntry.artSrc} alt={`${selectedEntry.name}の大きなイラスト`} className={styles.detailArt} />
                <p className={styles.kicker}>CAT FRIEND</p>
                <h3 id="collection-detail-title">{selectedEntry.name}</h3>
                <strong>{selectedEntry.subtitle}</strong>
                <p>{selectedEntry.description}</p>
                <span className={styles.discoveredBadge}><Check aria-hidden="true" /> 発見ずみ</span>
              </>
            ) : (
              <div className={styles.lockedDetail}>
                <LockKeyhole aria-hidden="true" />
                <p className={styles.kicker}>DISCOVERY HINT</p>
                <h3 id="collection-detail-title">見つけかたのヒント</h3>
                <p>{selectedEntry.hint}</p>
              </div>
            )
          ) : (
            <div className={styles.detailPlaceholder}>
              <BookOpen aria-hidden="true" />
              <h3 id="collection-detail-title">カード詳細</h3>
              <p>カードを選ぶと、三匹それぞれの紹介を確認できます。</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
