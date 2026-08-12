"use client"

import { useMemo, useState } from "react"
import { Check, ChefHat, Sparkles } from "lucide-react"
import { useProgression } from "@/components/progression-provider"
import { createEventId, type CafeMenuCreation } from "@/lib/progression"
import styles from "@/components/experience.module.css"

type MenuDraft = Omit<CafeMenuCreation, "id" | "createdAt">
const OPTIONS = {
  base: [["soda", "ソーダ"], ["milk", "ミルク"], ["berry", "ベリー"]],
  scoop: [["vanilla", "バニラ"], ["strawberry", "いちご"], ["mint", "ミント"]],
  topping: [["cherry", "さくらんぼ"], ["cookie", "猫クッキー"], ["star", "星シュガー"]],
  garnish: [["ribbon", "リボン"], ["paw", "肉球"], ["flower", "お花"]],
} as const

function MenuPreview({ menu }: { menu: MenuDraft }) {
  return (
    <div className={styles.menuGlass} data-base={menu.base} data-scoop={menu.scoop} aria-label="作成中の猫カフェメニュー">
      <span className={styles.menuScoop} />
      <span className={styles.menuTopping} data-topping={menu.topping}>{menu.topping === "cherry" ? "●" : menu.topping === "cookie" ? "猫" : "★"}</span>
      <span className={styles.menuGarnish} data-garnish={menu.garnish}>{menu.garnish === "ribbon" ? "⌁" : menu.garnish === "paw" ? "●" : "✿"}</span>
      <i /><b />
    </div>
  )
}

export function CafeMenuMaker() {
  const { state, recordEvent } = useProgression()
  const [draft, setDraft] = useState<MenuDraft>({ base: "soda", scoop: "vanilla", topping: "cherry", garnish: "paw" })
  const [saved, setSaved] = useState(false)
  const menuName = useMemo(() => {
    const label = (key: keyof typeof OPTIONS, value: string) => OPTIONS[key].find(([id]) => id === value)?.[1]
    return `${label("base", draft.base)}と${label("scoop", draft.scoop)}の${label("garnish", draft.garnish)}パフェ`
  }, [draft])

  const saveMenu = () => {
    const id = `menu-${draft.base}-${draft.scoop}-${draft.topping}-${draft.garnish}`
    const accepted = recordEvent({ type: "room.menuSaved", eventId: createEventId("cafe-menu"), occurredAt: new Date().toISOString(), menu: { id, ...draft } })
    setSaved(accepted)
  }

  return (
    <section className={styles.menuMaker} aria-labelledby="menu-maker-title">
      <div className={styles.sectionHeading}><div><p className={styles.kicker}><ChefHat /> CAFE MENU LAB</p><h3 id="menu-maker-title">猫カフェ・メニュー工房</h3></div><small>{state.room.menuCreations.length}作品</small></div>
      <div className={styles.menuMakerLayout}>
        <div className={styles.menuPreview}><MenuPreview menu={draft} /><strong>{menuName}</strong><p>三匹の審査員へ出す、今日のおすすめです。</p></div>
        <div className={styles.menuOptions}>
          {(Object.keys(OPTIONS) as (keyof typeof OPTIONS)[]).map((key) => (
            <fieldset key={key}><legend>{key === "base" ? "ドリンク" : key === "scoop" ? "アイス" : key === "topping" ? "トッピング" : "飾り"}</legend><div>{OPTIONS[key].map(([id, label]) => <button key={id} type="button" aria-pressed={draft[key] === id} onClick={() => { setDraft((current) => ({ ...current, [key]: id })); setSaved(false) }}>{label}</button>)}</div></fieldset>
          ))}
          <button className={styles.menuSaveButton} type="button" onClick={saveMenu}>{saved ? <><Check />カフェに飾りました</> : <><Sparkles />メニューを完成する</>}</button>
        </div>
      </div>
    </section>
  )
}
