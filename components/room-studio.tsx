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
    reply: "トラちゃんは壁を見上げ、キキとフワは涼しい床でくつろぎました。",
  },
  "wall-strawberry": {
    lead: "美雪「いちごミルク色、かわいい！」",
    reply: "フワが肉球で合格。三匹そろって壁の前で記念撮影です。",
  },
  "window-sunny": {
    lead: "美雪「ひなたで猫たちがお昼寝できるね」",
    reply: "トラちゃんが日なたを発見。キキとフワも並んでお昼寝を始めました。",
  },
  "window-starry": {
    lead: "美雪「星がいっぱい！キキにも見せよう」",
    reply: "キキが一番星を発見。トラちゃんとフワも窓辺へ集合しました。",
  },
  "shelf-cups": {
    lead: "美雪「肉球カップをきれいに並べたよ」",
    reply: "三匹が店員さん役。トラちゃんはカップの横で元気にお出迎えです。",
  },
  "shelf-books": {
    lead: "美雪「笑える日記は、この棚にしまおう」",
    reply: "キキは静かに読書。フワは開いた本を枕にして眠っています。",
  },
  "table-creamsoda": {
    lead: "美雪「テーブルをすてきに飾ったよ」",
    reply: "三匹は泡をじっと観察中。トラちゃんだけ鼻に泡をつけています。",
  },
  "table-pancakes": {
    lead: "美雪「猫の顔、上手にできた！」",
    reply: "三匹がそっくり度を審査。フワは自分の顔のパンケーキを選びました。",
  },
  "floor-yarn": {
    lead: "美雪「三色の毛糸、どれから遊ぶ？」",
    reply: "三匹が一斉にスタート。キキがいちばん先に毛糸玉をつかまえました。",
  },
  "floor-flowers": {
    lead: "美雪「お花のいい香りがするね」",
    reply: "三匹はそっとくんくん。フワは花かごの横で上品にポーズしました。",
  },
  "center-cat-tree": {
    lead: "美雪「いちばん上まで登れるかな？」",
    reply: "トラちゃんが三秒で頂上へ。キキとフワは下から見守っています。",
  },
  "center-piano": {
    lead: "美雪「肉球で、にゃんにゃん伴奏！」",
    reply: "三匹が一音ずつ演奏。最後はそろって大きくおじぎしました。",
  },
  "right-cat-bed": {
    lead: "美雪「ふかふかだから、順番に使おうね」",
    reply: "トラちゃん、キキ、フワが丸くなって、ベッドは満席です。",
  },
  "right-treasure": {
    lead: "美雪「宝箱の中は、猫のおもちゃがいっぱい！」",
    reply: "キキが王冠を発見。トラちゃんとフワはリボンを選びました。",
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
    lead: "家具を配置すると、美雪と三匹の一言劇が始まります。",
    reply: "トラちゃん、キキ、フワは次の家具を待っています。",
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
        reply: "三匹は空いた場所を一周して、次の家具を待っています。",
      })
      return
    }

    const item = itemById.get(itemId)
    const scene = ROOM_REACTIONS[itemId] ?? {
      lead: "美雪「お部屋にぴったり！」",
      reply: "トラちゃん、キキ、フワも気に入った様子です。",
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
