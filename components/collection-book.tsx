"use client"

import { useMemo, useRef, useState } from "react"
import { ArrowLeft, BookOpen, Cat, Check, LockKeyhole, PawPrint, Search, Sparkles } from "lucide-react"
import { ExperienceArtwork } from "@/components/experience-artwork"
import styles from "@/components/experience.module.css"

export type CollectionKind = "cat" | "naokun"

export type CollectionDefinition = {
  id: string
  kind: CollectionKind
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

const CAT_COLLECTIONS: readonly CollectionDefinition[] = [
  { id: "cat-maron", kind: "cat", name: "マロン", subtitle: "お店のやさしい店長", description: "みんなの様子をよく見ている茶トラ。困ったときは、しっぽで道を教えてくれる。", hint: "猫カフェのホームを見てみよう", artSrc: "/content/collections/cats/maron.webp", rarity: 1 },
  { id: "cat-yuki", kind: "cat", name: "ユキ", subtitle: "ふわふわ雲の猫", description: "白くてふわふわ。クリームソーダの泡を見つめるのが好き。", hint: "ねこ占いをしてみよう", artSrc: "/content/collections/cats/yuki.webp", rarity: 1 },
  { id: "cat-mike", kind: "cat", name: "ミケ", subtitle: "おやつ見張り番", description: "三毛模様の元気な女の子。なおくんのおやつだけは絶対に見逃さない。", hint: "絵日記を3つ読んでみよう", artSrc: "/content/collections/cats/mike.webp", rarity: 1 },
  { id: "cat-kuro", kind: "cat", name: "クロ", subtitle: "夜のすみっこ探検家", description: "暗い場所で目がきらり。なくしもの探しがとても得意。", hint: "神経衰弱で遊んでみよう", artSrc: "/content/collections/cats/kuro.webp", rarity: 2 },
  { id: "cat-tora", kind: "cat", name: "トラまる", subtitle: "ゲームの応援団長", description: "しましましっぽでリズムを取る。ハイスコアが出ると一番に飛び上がる。", hint: "どれかのゲームで勝ってみよう", artSrc: "/content/collections/cats/tora.webp", rarity: 2 },
  { id: "cat-sora", kind: "cat", name: "ソラ", subtitle: "窓辺のおひるね名人", description: "空色の首輪が目印。晴れの日のいちばん暖かい席を知っている。", hint: "猫カフェのお部屋に家具を置こう", artSrc: "/content/collections/cats/sora.webp", rarity: 1 },
  { id: "cat-kinako", kind: "cat", name: "きなこ", subtitle: "ぬりえの色博士", description: "きなこ色の毛並み。すてきな色の組み合わせを肉球で選んでくれる。", hint: "ぬりえを完成させよう", artSrc: "/content/collections/cats/kinako.webp", rarity: 2 },
  { id: "cat-chibi", kind: "cat", name: "ちび", subtitle: "小さな大冒険家", description: "体は小さいけれど勇気は大きい。秘密の扉を最初に見つけた。", hint: "ものがたり第1話を読もう", artSrc: "/content/collections/cats/chibi.webp", rarity: 3 },
  { id: "cat-latte", kind: "cat", name: "ラテ", subtitle: "まぜまぜパティシエ", description: "泡立て器の音がするとすぐに集合。猫用ケーキ作りを手伝う。", hint: "今日のミッションを2つ達成しよう", artSrc: "/content/collections/cats/latte.webp", rarity: 2 },
  { id: "cat-sakura", kind: "cat", name: "さくら", subtitle: "リボンのおしゃれ番長", description: "季節のリボンを毎日選ぶ。春色の家具が大のお気に入り。", hint: "特別な家具を買ってみよう", artSrc: "/content/collections/cats/sakura.webp", rarity: 3 },
]

const NAOKUN_TRANSFORMATIONS: readonly CollectionDefinition[] = [
  { id: "naokun-poop-classic", kind: "naokun", name: "王道うんちなおくん", subtitle: "まずはここから", description: "猫たちの『うんちになあれ』で、つやつやの王道スタイルに。本人は満面の笑顔。", hint: "絵日記を1つ読もう", artSrc: "/content/collections/naokun/poop-classic.webp", rarity: 1 },
  { id: "naokun-poop-soda", kind: "naokun", name: "クリームソーダうんち", subtitle: "しゅわしゅわ衣装", description: "白いふわふわ帽子と赤い玉飾りをつけた夏の人気者。赤白の紙リボンまで、ぜんぶ撮影用の衣装です。", hint: "猫うらないをしてみよう", artSrc: "/content/collections/naokun/poop-soda.webp", rarity: 2 },
  { id: "naokun-poop-gold", kind: "naokun", name: "金のうんち王", subtitle: "まぶしい達成報酬", description: "ミッション達成の結果、全身がぴかぴかに。猫たちは目を細めた。", hint: "今日のミッションを達成し、報酬を受け取る", artSrc: "/content/collections/naokun/poop-gold.webp", rarity: 3 },
  { id: "naokun-poop-rainbow", kind: "naokun", name: "虹色うんちロケット", subtitle: "空へ出発！", description: "七色のしっぽを引いて店内を一周。着地は猫ベッドでふわり。", hint: "ゲームを5回遊んでみよう", artSrc: "/content/collections/naokun/poop-rainbow.webp", rarity: 3 },
  { id: "naokun-poop-chef", kind: "naokun", name: "うんちシェフ", subtitle: "注文札はまかせて", description: "厨房の外の応援席で、注文札とタイマーを持つ係。札を全部逆さまに並べて、猫たちに直されました。", hint: "お部屋のテーブルに家具を置こう", artSrc: "/content/collections/naokun/poop-chef.webp", rarity: 2 },
  { id: "naokun-poop-bakery", kind: "naokun", name: "うんちパン屋さん", subtitle: "看板ポーズは得意", description: "お店から離れた撮影台で、パン屋さんの看板役。猫たちの撮影待ちの列ができて、本人だけが大いそがし。", hint: "絵日記を5つ読もう", artSrc: "/content/collections/naokun/poop-bakery.webp", rarity: 1 },
  { id: "naokun-poop-ninja", kind: "naokun", name: "忍者うんち", subtitle: "かくれたつもり", description: "黒い頭巾でカーテンの陰へ。得意顔だけが大きくはみ出して、すぐ見つかった。", hint: "神経衰弱で遊んでみよう", artSrc: "/content/collections/naokun/poop-ninja.webp", rarity: 2 },
  { id: "naokun-poop-detective", kind: "naokun", name: "名探偵うんち", subtitle: "事件は猫カフェで", description: "虫めがねで消えた赤いリボンを追う。リボンは自分の帽子についていました。", hint: "猫クイズで5,000点をめざそう", artSrc: "/content/collections/naokun/poop-detective.webp", rarity: 2 },
  { id: "naokun-poop-pirate", kind: "naokun", name: "海賊うんち船長", subtitle: "宝は肉球スタンプ", description: "段ボール船で出航。宝箱を開けたら、猫たちの肉球スタンプでいっぱいでした。", hint: "『段ボール海のうんち船長』を読もう", artSrc: "/content/collections/naokun/poop-pirate.webp", rarity: 2 },
  { id: "naokun-poop-space", kind: "naokun", name: "宇宙うんち飛行士", subtitle: "無重力でくるくる", description: "まるいヘルメットで宇宙へ。猫の肉球通信だけは届くらしい。", hint: "記憶力チャレンジでレベル6へ", artSrc: "/content/collections/naokun/poop-space.webp", rarity: 3 },
  { id: "naokun-poop-samurai", kind: "naokun", name: "うんち侍", subtitle: "一本しっぽ勝負", description: "新聞紙の刀で猫じゃらしに挑む。三秒で弟子入りした。", hint: "なおくん救出で10回助けよう", artSrc: "/content/collections/naokun/poop-samurai.webp", rarity: 2 },
  { id: "naokun-poop-snowman", kind: "naokun", name: "雪だるまうんち", subtitle: "ひんやりふわふわ", description: "雪玉を重ねたらなおくんの顔が出現。猫はマフラーの中でお昼寝。", hint: "冬のスキンで遊ぼう", artSrc: "/content/collections/naokun/poop-snowman.webp", rarity: 2 },
  { id: "naokun-poop-sakura", kind: "naokun", name: "桜ひらひらうんち", subtitle: "春のふんわり変身", description: "桜色の花びらマントでご満悦。猫たちが紙の花びらを一枚ずつ足してくれました。", hint: "春のスキンで遊ぼう", artSrc: "/content/collections/naokun/poop-sakura.webp", rarity: 2 },
  { id: "naokun-poop-pumpkin", kind: "naokun", name: "かぼちゃうんち", subtitle: "秋のパレード隊長", description: "丸いかぼちゃ帽子で登場。猫たちの列を先導したのに、三歩で最後尾になりました。", hint: "秋のスキンで遊ぼう", artSrc: "/content/collections/naokun/poop-pumpkin.webp", rarity: 2 },
  { id: "naokun-poop-mermaid", kind: "naokun", name: "人魚うんち", subtitle: "泡のステージ", description: "きらきらの尾びれで紙の波を泳ぐポーズ。拍手は猫の肉球音です。", hint: "ぬりえを1枚完成させよう", artSrc: "/content/collections/naokun/poop-mermaid.webp", rarity: 3 },
  { id: "naokun-poop-princess", kind: "naokun", name: "うんち姫", subtitle: "ティアラがぴったり", description: "美雪のティアラを借り、優雅にくるり。猫たちは執事役を拒否。", hint: "図鑑を10こ発見しよう", artSrc: "/content/collections/naokun/poop-princess.webp", rarity: 2 },
  { id: "naokun-poop-robot", kind: "naokun", name: "メカうんちロボ", subtitle: "ピコピコおそうじ", description: "ボタンを押すと『うれしいです』と話す。おそうじ機能はまだない。", hint: "3種類のゲームで遊ぼう", artSrc: "/content/collections/naokun/poop-robot.webp", rarity: 3 },
  { id: "naokun-poop-music", kind: "naokun", name: "うんち音楽指揮者", subtitle: "にゃんこ大合奏！", description: "しっぽの鈴と手拍子と猫たちの声を、指揮棒ひとつでまとめるごきげんな音楽指揮者。アンコールでは自分だけ四拍おくれる。", hint: "音をONにしてゲームを2回遊ぶか、ものがたり第3話を読もう", artSrc: "/content/collections/naokun/poop-music.webp", rarity: 1 },
  { id: "naokun-poop-artist", kind: "naokun", name: "画家うんち", subtitle: "自画像は茶色一色", description: "大きなベレー帽で筆を握る。美雪が虹色の絵の具を渡してくれた。", hint: "ぬりえを3枚完成させよう", artSrc: "/content/collections/naokun/poop-artist.webp", rarity: 2 },
  { id: "naokun-poop-cactus", kind: "naokun", name: "さぼてんうんち", subtitle: "とげはやわらか", description: "緑の着ぐるみで窓辺にじっと立つ。猫が水をあげようとした。", hint: "お部屋に植物を置こう", artSrc: "/content/collections/naokun/poop-cactus.webp", rarity: 2 },
  { id: "naokun-poop-cake", kind: "naokun", name: "お誕生日うんちケーキ", subtitle: "紙の輪っかがずり落ちた", description: "ケーキに見える段ボール衣装と赤いハート飾りで、離れた撮影台へ。おじぎで一番上の輪っかが横へずれ、猫といっしょに大笑いしました。", hint: "絵日記を10こ読んでみよう", artSrc: "/content/collections/naokun/poop-cake.webp", rarity: 3 },
  { id: "naokun-poop-hero", kind: "naokun", name: "正義のうんちヒーロー", subtitle: "マントがなびく", description: "猫のおもちゃを棚の下から救出。今日いちばんの拍手をもらった。", hint: "ものがたり第1話で猫チームを選ぶか、『正義のうんちマン』を読もう", artSrc: "/content/collections/naokun/poop-hero.webp", rarity: 3 },
  { id: "naokun-poop-ghost", kind: "naokun", name: "ふわふわ雲うんち", subtitle: "ぜんぜん怖くない", description: "猫カフェの上をふわふわ漂う雲になり、茶トラにやさしくつつかれた。", hint: "『せんぷうきとうんち雲』を読もう", artSrc: "/content/collections/naokun/poop-cloud.webp", rarity: 2 },
  { id: "naokun-poop-cat", kind: "naokun", name: "猫みみうんち", subtitle: "ついに仲間入り？", description: "猫耳としっぽをつけて『にゃお』。本物の猫から鳴き方講座が始まった。", hint: "すべての猫を発見しよう", artSrc: "/content/collections/naokun/poop-cat.webp", rarity: 3 },
]

export const COLLECTION_CATALOG: readonly CollectionDefinition[] = [
  ...CAT_COLLECTIONS,
  ...NAOKUN_TRANSFORMATIONS,
]

type CollectionFilter = "all" | CollectionKind

export function CollectionBook({
  unlockedIds,
  newIds = [],
  entries = COLLECTION_CATALOG,
  onOpenEntry,
  onBack,
}: CollectionBookProps) {
  const [filter, setFilter] = useState<CollectionFilter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const detailRef = useRef<HTMLElement | null>(null)
  const unlocked = useMemo(() => new Set(unlockedIds), [unlockedIds])
  const fresh = useMemo(() => new Set(newIds), [newIds])
  const visibleEntries = filter === "all" ? entries : entries.filter((entry) => entry.kind === filter)
  const selectedEntry = visibleEntries.find((entry) => entry.id === selectedId)
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

  const changeFilter = (nextFilter: CollectionFilter) => {
    setFilter(nextFilter)
    if (nextFilter !== filter) setSelectedId(null)
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
        <p className={styles.kicker}><Sparkles aria-hidden="true" /> COLLECTION BOOK</p>
        <h2 id="collection-title">ねこと変身コレクション</h2>
        <p>発見した仲間と変身を記録。未発見カードでは解放条件を確認できます。</p>
      </header>

      <div className={styles.collectionTabs} role="group" aria-label="図鑑の種類">
        {([
          ["all", "すべて", Search],
          ["cat", "猫図鑑", Cat],
          ["naokun", "なおくん変身", PawPrint],
        ] as const).map(([id, label, Icon]) => (
          <button key={id} type="button" aria-pressed={filter === id} onClick={() => changeFilter(id)}>
            <Icon aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div className={styles.collectionLayout}>
        <div className={styles.collectionGrid} aria-label="図鑑のカード">
          {visibleEntries.map((entry) => {
            const isUnlocked = unlocked.has(entry.id)
            const isSelected = selectedId === entry.id
            const collectionNumber = `No.${String(entries.indexOf(entry) + 1).padStart(2, "0")}`
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
                  alt={isUnlocked ? `${entry.name}の図鑑イラスト` : "まだ見つけていない仲間のシルエット"}
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
                  {Array.from({ length: 3 }, (_, index) => <Sparkles key={index} aria-hidden="true" data-on={index < entry.rarity || undefined} />)}
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
                <p className={styles.kicker}>{selectedEntry.kind === "cat" ? "CAT FRIEND" : "NAOKUN TRANSFORM"}</p>
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
              <p>カードを選ぶと、紹介・レア度・未発見時の解放条件を確認できます。</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
