"use client"

import { useMemo, useState } from "react"
import { BookOpenCheck, Check, Gift, Newspaper, PawPrint, Sparkles } from "lucide-react"
import { useProgression } from "@/components/progression-provider"
import { getCatGestures, getWeeklyNews } from "@/lib/cat-club-content"
import { createEventId, getCatRequests, getLocalDateKey } from "@/lib/progression"
import { downloadTextCard } from "@/lib/download-card"
import styles from "@/components/experience.module.css"

function eventTimestamp() { return new Date().toISOString() }

export function CatClubExtras() {
  const { state, recordEvent } = useProgression()
  const gestures = useMemo(() => getCatGestures(state), [state])
  const requests = useMemo(() => getCatRequests(state), [state])
  const news = useMemo(() => getWeeklyNews(state), [state])
  const [panel, setPanel] = useState<"gestures" | "requests" | "news">("gestures")
  const unlockedGestures = gestures.filter((gesture) => gesture.unlocked).length

  const claimRequest = (requestId: string) => {
    recordEvent({
      type: "request.claimed",
      eventId: createEventId("cat-request"),
      occurredAt: eventTimestamp(),
      requestId,
      requestDate: getLocalDateKey(),
    })
  }

  return (
    <section className={styles.clubExtras} aria-labelledby="club-extras-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}><Sparkles aria-hidden="true" /> CAT CLUB ARCHIVES</p>
          <h3 id="club-extras-title">三匹の活動ファイル</h3>
        </div>
      </div>
      <div className={styles.clubExtraTabs} role="tablist" aria-label="活動ファイルを選ぶ">
        <button type="button" role="tab" aria-selected={panel === "gestures"} onClick={() => setPanel("gestures")}><PawPrint />しぐさ図鑑</button>
        <button type="button" role="tab" aria-selected={panel === "requests"} onClick={() => setPanel("requests")}><Gift />三匹のお願い</button>
        <button type="button" role="tab" aria-selected={panel === "news"} onClick={() => setPanel("news")}><Newspaper />週間新聞</button>
      </div>

      {panel === "gestures" && (
        <div className={styles.gesturePanel} role="tabpanel">
          <p className={styles.extraLead}>{unlockedGestures} / {gestures.length} 発見。遊び方が増えると、三匹の新しいしぐさが見つかります。</p>
          <div className={styles.gestureGrid}>
            {gestures.map((gesture) => (
              <article key={gesture.id} data-locked={!gesture.unlocked || undefined}>
                <span aria-hidden="true">{gesture.unlocked ? gesture.emoji : "?"}</span>
                <small>{gesture.catName}</small>
                <strong>{gesture.unlocked ? gesture.name : "まだ観察中"}</strong>
                <p>{gesture.unlocked ? gesture.description : gesture.unlockHint}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {panel === "requests" && (
        <div className={styles.requestList} role="tabpanel">
          {requests.map((request) => (
            <article key={request.id} data-complete={request.completed || undefined}>
              <span className={styles.requestCat}>{request.catName}</span>
              <div><strong>{request.title}</strong><p>{request.description}</p></div>
              {request.claimed ? <span className={styles.requestDone}><Check />達成ずみ</span> : request.completed ? (
                <button type="button" onClick={() => claimRequest(request.id)}><Gift />{request.reward}を押す</button>
              ) : <small>挑戦中</small>}
            </article>
          ))}
        </div>
      )}

      {panel === "news" && (
        <article className={styles.weeklyPaper} role="tabpanel">
          <header><Newspaper aria-hidden="true" /><div><small>MIYUKI CAT CAFE WEEKLY</small><h4>ねこカフェ新聞</h4><time>{news.weekLabel}</time></div></header>
          <h5>{news.headline}</h5>
          <div className={styles.newsStats}>
            <span>ゲーム <b>{news.counts.game}</b></span><span>日記 <b>{news.counts.diary}</b></span><span>作品 <b>{news.counts.coloring + news.counts.menu}</b></span><span>お願い <b>{news.counts.request}</b></span>
          </div>
          <p><BookOpenCheck aria-hidden="true" />{news.catComment}</p>
          <button type="button" className={styles.newsSaveButton} onClick={() => downloadTextCard("miyuki-cat-cafe-weekly.png", "ねこカフェ新聞", [news.weekLabel, news.headline, `ゲーム ${news.counts.game}回・日記 ${news.counts.diary}件・作品 ${news.counts.coloring + news.counts.menu}点`, news.catComment])}><Newspaper />新聞を画像保存</button>
        </article>
      )}
    </section>
  )
}
