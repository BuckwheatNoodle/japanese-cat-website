"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Check, CircleDollarSign, Home, PackageOpen, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react"
import { ExperienceArtwork } from "@/components/experience-artwork"
import styles from "@/components/experience.module.css"
import { ROOM_ITEM_DEFINITIONS, type RoomSlotId as ProgressionRoomSlotId } from "@/lib/progression"

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
  onPlaceItem: (slot: RoomSlotId, itemId: string | null) => void
  onBuyItem: (itemId: string) => void
  onBack?: () => void
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
  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])
  const selectedSlotInfo = ROOM_SLOTS.find((slot) => slot.id === selectedSlot) ?? ROOM_SLOTS[0]
  const compatibleItems = items.filter((item) => item.slot === selectedSlot)

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
        <h2 id="room-title">わたしの猫カフェ</h2>
        <p>置きたい場所を選んでから、ぴったりの家具を選ぼう。</p>
      </header>

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
              <button type="button" className={styles.clearSlotButton} onClick={() => onPlaceItem(selectedSlot, null)}>
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
                      onClick={() => onPlaceItem(selectedSlot, item.id)}
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
