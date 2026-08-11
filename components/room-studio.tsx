"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Cat, Check, CircleDollarSign, Home, MessageCircle, PackageOpen, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react"
import { ExperienceArtwork } from "@/components/experience-artwork"
import styles from "@/components/experience.module.css"
import { ROOM_ITEM_DEFINITIONS, type ActionCheck, type RoomSlotId as ProgressionRoomSlotId } from "@/lib/progression"

export type RoomSlotId = ProgressionRoomSlotId

export type RoomItem = {
  id: string
  name: string
  description: string
  slot: RoomSlotId
  artSrc: string
  price: number
  owned: boolean
  rarity?: "normal" | "rare" | "special"
}

export type RoomStudioProps = {
  coins: number
  equipped: Partial<Record<RoomSlotId, string | null>>
  items?: readonly RoomItem[]
  onPlaceItem: (slot: RoomSlotId, itemId: string | null) => ActionCheck | void
  onBuyItem: (itemId: string) => void
  onBack?: () => void
}

type RoomReaction = {
  title: string
  lead: string
  reply: string
}

export const ROOM_SLOTS: ReadonlyArray<{ id: RoomSlotId; label: string }> = [
  { id: "wall", label: "かべ" },
  { id: "window", label: "まど" },
  { id: "shelf", label: "たな" },
  { id: "table", label: "テーブル" },
  { id: "floorLeft", label: "ひだりの床" },
  { id: "floorCenter", label: "まんなかの床" },
  { id: "floorRight", label: "みぎの床" },
]

const ART_BY_ITEM: Record<string, string> = {
  "wall-mint": "/content/room/items/wall-mint.webp",
  "wall-strawberry": "/content/room/items/wall-strawberry.webp",
  "window-sunny": "/content/room/items/window-sunny.webp",
  "window-starry": "/content/room/items/window-starry.webp",
  "shelf-cups": "/content/room/items/shelf-cups.webp",
  "shelf-books": "/content/room/items/shelf-books.webp",
  "table-creamsoda": "/content/room/items/table-creamsoda.webp",
  "table-pancakes": "/content/room/items/table-pancakes.webp",
  "floor-yarn": "/content/room/items/floor-yarn.webp",
  "floor-flowers": "/content/room/items/floor-flowers.webp",
  "center-cat-tree": "/content/room/items/cat-tree.webp",
  "center-piano": "/content/room/items/center-piano.webp",
  "right-cat-bed": "/content/room/items/cat-bed.webp",
  "right-treasure": "/content/room/items/right-treasure.webp",
}

const ROOM_REACTIONS: Record<string, Omit<RoomReaction, "title">> = {
  "wall-mint": {
    lead: "美雪「クリームソーダみたいで、すずしそう！」",
    reply: "猫たちは壁を見上げ、なおくんはミントうんち役に立候補しました。",
  },
  "wall-strawberry": {
    lead: "美雪「いちごミルク色、かわいい！」",
    reply: "猫たちは肉球で合格。なおくんは、いちごうんちになって壁と記念撮影です。",
  },
  "window-sunny": {
    lead: "美雪「ひなたで猫たちがお昼寝できるね」",
    reply: "なおくんは太陽うんちになって照らす気満々。猫には本物の窓を選ばれました。",
  },
  "window-starry": {
    lead: "美雪「星がいっぱい！クロにも見せよう」",
    reply: "クロが一番星を発見。なおくんは宇宙うんちになり、まだ部屋の中を飛んでいます。",
  },
  "shelf-cups": {
    lead: "美雪「肉球カップをきれいに並べたよ」",
    reply: "猫たちが店員さん役。なおくんは離れた撮影台で、カップの絵札を持つうんち店長になりました。",
  },
  "shelf-books": {
    lead: "美雪「笑える日記は、この棚にしまおう」",
    reply: "猫たちは静かに読書。なおくんは自分がうんちになる回だけ、こっそり前向きに並べました。",
  },
  "table-creamsoda": {
    lead: "美雪「テーブルをすてきに飾ったよ」",
    reply: "猫たちは泡を観察中。なおくんは離れた撮影台で、ソーダ色うんちの絵札を掲げて得意顔です。",
  },
  "table-pancakes": {
    lead: "美雪「猫の顔、上手にできた！」",
    reply: "猫たちはそっくり度を審査。なおくんは厨房の外の看板へうんち顔も描き足し、美雪にそっと消されました。",
  },
  "floor-yarn": {
    lead: "美雪「三色の毛糸、どれから遊ぶ？」",
    reply: "猫たちは一斉にスタート。なおくんは毛糸に巻かれ、しましまうんち役になって笑っています。",
  },
  "floor-flowers": {
    lead: "美雪「お花のいい香りがするね」",
    reply: "猫たちはそっとくんくん。なおくんは花うんちになって、かごの横で堂々とポーズ！",
  },
  "center-cat-tree": {
    lead: "美雪「いちばん上まで登れるかな？」",
    reply: "猫たちは三秒で頂上へ。なおくんは木の下で、見守りうんち係を楽しんでいます。",
  },
  "center-piano": {
    lead: "美雪「肉球で、にゃんにゃん伴奏！」",
    reply: "猫たちが一音ずつ演奏。なおくんは指揮者うんちになり、曲より大きくおじぎしました。",
  },
  "right-cat-bed": {
    lead: "美雪「ふかふかだから、順番に使おうね」",
    reply: "猫たちが丸くなって満席。なおくんは雲うんちクッションになれてごきげんです。",
  },
  "right-treasure": {
    lead: "美雪「宝箱の中は、変身グッズだらけ！」",
    reply: "猫たちが王冠を発見。なおくんは金のうんち王に変身し、まぶしくて全員ほそ目です。",
  },
}

export const ROOM_ITEM_CATALOG: readonly RoomItem[] = ROOM_ITEM_DEFINITIONS.map((item) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  slot: item.slot,
  artSrc: ART_BY_ITEM[item.id] ?? "/content/room/items/wall-frame.webp",
  price: item.price,
  owned: Boolean(item.starter),
  rarity: item.price >= 70 ? "special" : item.price >= 45 ? "rare" : "normal",
}))

export function RoomStudio({
  coins,
  equipped,
  items = ROOM_ITEM_CATALOG,
  onPlaceItem,
  onBuyItem,
  onBack,
}: RoomStudioProps) {
  const [selectedSlot, setSelectedSlot] = useState<RoomSlotId>("table")
  const [reaction, setReaction] = useState<RoomReaction>({
    title: "テーブルを選択中",
    lead: "家具を配置すると、美雪・猫たち・なおくんの一言劇が始まります。",
    reply: "なおくんはもう、次のうんち役を選んで待っています。",
  })
  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])
  const selectedSlotInfo = ROOM_SLOTS.find((slot) => slot.id === selectedSlot) ?? ROOM_SLOTS[0]
  const compatibleItems = items.filter((item) => item.slot === selectedSlot)

  const handlePlaceItem = (slot: RoomSlotId, itemId: string | null) => {
    const result = onPlaceItem(slot, itemId)
    if (result && !result.ok) return

    if (!itemId) {
      setReaction({
        title: `${ROOM_SLOTS.find((candidate) => candidate.id === slot)?.label ?? "家具"}を空けました`,
        lead: "美雪「次は何を置こうかな？」",
        reply: "猫たちは空いた場所を一周。なおくんは次の変身スペースだと思っています。",
      })
      return
    }

    const item = itemById.get(itemId)
    const scene = ROOM_REACTIONS[itemId] ?? {
      lead: "美雪「お部屋にぴったり！」",
      reply: "猫たちも気に入った様子。なおくんは楽しい変身を考えています。",
    }
    setReaction({ title: `${item?.name ?? "家具"}を配置しました`, ...scene })
  }

  return (
    <section className={styles.experienceScreen} aria-labelledby="room-title">
      <div className={styles.screenToolbar}>
        {onBack && (
          <button type="button" className={styles.backButton} onClick={onBack}>
            <ArrowLeft aria-hidden="true" /> 猫クラブへ
          </button>
        )}
        <span className={styles.coinPill}><CircleDollarSign aria-hidden="true" /><strong>{coins.toLocaleString("ja-JP")}</strong></span>
      </div>

      <header className={styles.compactHeader}>
        <p className={styles.kicker}><Home aria-hidden="true" /> MY CAT CAFE ROOM</p>
        <h2 id="room-title">猫カフェ編集室</h2>
        <p>場所を選び、所持している家具を配置します。組み合わせで一言劇も変化します。</p>
      </header>

      <aside className={styles.roomReaction} role="status" aria-live="polite" aria-atomic="true">
        <span className={styles.roomReactionIcon} aria-hidden="true"><MessageCircle /></span>
        <span className={styles.roomReactionCopy}>
          <strong>{reaction.title}</strong>
          <span>{reaction.lead}</span>
          <span><Cat aria-hidden="true" />{reaction.reply}</span>
        </span>
      </aside>

      <div className={styles.roomLayout}>
        <div className={styles.roomCanvas} aria-label="猫カフェのお部屋">
          <ExperienceArtwork
            src="/content/room/empty-cafe.webp"
            alt="家具を飾れる、クリームソーダ色の猫カフェのお部屋"
            className={styles.roomBackdrop}
            fit="cover"
            eager
          />
          {ROOM_SLOTS.map((slot) => {
            const itemId = equipped[slot.id]
            const item = itemId ? itemById.get(itemId) : undefined
            const isSelected = slot.id === selectedSlot
            return (
              <button
                key={slot.id}
                type="button"
                className={styles.roomSlot}
                data-slot={slot.id}
                data-empty={!item || undefined}
                data-selected={isSelected || undefined}
                aria-pressed={isSelected}
                aria-label={`${slot.label}。${item ? `${item.name}を置いています` : "何も置いていません"}`}
                onClick={() => setSelectedSlot(slot.id)}
              >
                {item ? (
                  <ExperienceArtwork src={item.artSrc} alt={item.name} className={styles.placedItemArt} />
                ) : (
                  <span className={styles.emptySlotLabel}><Plus aria-hidden="true" />{slot.label}</span>
                )}
              </button>
            )
          })}
        </div>

        <section className={styles.inventoryPanel} aria-labelledby="inventory-title">
          <div className={styles.inventoryHeading}>
            <div>
              <p className={styles.kicker}><PackageOpen aria-hidden="true" /> ITEM BOX</p>
              <h3 id="inventory-title">{selectedSlotInfo.label}に置くもの</h3>
            </div>
            {equipped[selectedSlot] && (
              <button type="button" className={styles.clearSlotButton} onClick={() => handlePlaceItem(selectedSlot, null)}>
                <Trash2 aria-hidden="true" /> はずす
              </button>
            )}
          </div>

          <div className={styles.itemList}>
            {compatibleItems.map((item) => {
              const isEquipped = equipped[selectedSlot] === item.id
              const canAfford = coins >= item.price
              return (
                <article key={item.id} className={styles.itemCard} data-equipped={isEquipped || undefined}>
                  <ExperienceArtwork src={item.artSrc} alt={item.name} className={styles.itemArt} />
                  <div className={styles.itemCopy}>
                    <span className={styles.itemNameRow}>
                      <strong>{item.name}</strong>
                      {item.rarity && item.rarity !== "normal" && <small data-rarity={item.rarity}>{item.rarity === "special" ? "とくべつ" : "レア"}</small>}
                    </span>
                    <p>{item.description}</p>
                  </div>
                  {item.owned ? (
                    <button
                      type="button"
                      className={styles.placeButton}
                      disabled={isEquipped}
                      onClick={() => handlePlaceItem(selectedSlot, item.id)}
                    >
                      {isEquipped ? <><Check aria-hidden="true" /> おいてある</> : <><Sparkles aria-hidden="true" /> ここに置く</>}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.buyButton}
                      disabled={!canAfford}
                      onClick={() => onBuyItem(item.id)}
                      aria-label={`${item.name}を${item.price}にゃんコインで買う`}
                    >
                      <ShoppingBag aria-hidden="true" /> {item.price}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </section>
  )
}
