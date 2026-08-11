"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, BookHeart, Check, CircleDollarSign, LockKeyhole, RotateCcw, Sparkles, Square, Undo2, Volume2 } from "lucide-react"
import { ExperienceArtwork } from "@/components/experience-artwork"
import { useProgression } from "@/components/progression-provider"
import styles from "@/components/experience.module.css"

export type StoryChoice = {
  id: string
  label: string
  detail?: string
  nextNodeId: string
}

export type StoryNode = {
  id: string
  speaker: string
  title: string
  body: string
  artSrc: string
  artAlt: string
  stage: number
  choices?: readonly StoryChoice[]
  ending?: {
    label: string
    rewardCoins: number
    collectionId?: string
    progressionChoiceId?: string
  }
}

export type StoryChapter = {
  id: string
  number: number
  title: string
  subtitle: string
  startNodeId: string
  totalStages: number
  nodes: readonly StoryNode[]
}

export type StoryModeProps = {
  chapter?: StoryChapter
  chapters?: readonly StoryChapter[]
  unlockedChapterIds?: readonly string[]
  completedChapterIds?: readonly string[]
  isCompleted?: boolean
  onChoose?: (chapterId: string, nodeId: string, choiceId: string) => boolean | void
  onComplete: (chapterId: string, progressionChoiceId: string | undefined, rewardCoins: number, collectionId?: string) => boolean
  onBack?: () => void
}

export const STORY_CHAPTER_ONE: StoryChapter = {
  id: "cafe-opening",
  number: 1,
  title: "ひみつのソーダ扉",
  subtitle: "消えたさくらんぼとなおくんの大変身",
  startNodeId: "opening",
  totalStages: 5,
  nodes: [
    {
      id: "opening",
      speaker: "美雪",
      title: "さくらんぼが消えた！",
      body: "開店前の猫カフェ。クリームソーダにのせる大切なさくらんぼが、一箱まるごと消えていました。床には小さな肉球と、なぜか丸い茶色の足あと。なおくんは『ぼく、まだうんちになってないよ！』と少し残念そうです。",
      artSrc: "/content/story/paw-key-discovery.webp",
      artAlt: "空のさくらんぼ箱を見つめる美雪と猫たち、期待しているなおくん",
      stage: 1,
      choices: [
        { id: "kitchen", label: "キッチンを調べる", detail: "甘いにおいをたどってみよう", nextNodeId: "kitchen-clue" },
        { id: "garden", label: "中庭を調べる", detail: "肉球の足あとを追ってみよう", nextNodeId: "garden-clue" },
      ],
    },
    {
      id: "kitchen-clue",
      speaker: "マロン",
      title: "泡立て器がくるくる",
      body: "キッチンでは、だれも触っていない泡立て器がくるくる回っています。マロンが前足で止めると、ボウルの底からソーダ色の小さな鍵が出てきました。鍵には『うれしい変身ができる人だけ』と書いてあります。",
      artSrc: "/content/collections/naokun/poop-chef.webp",
      artAlt: "光る泡立て器とソーダ色の鍵を見つけた美雪とマロン",
      stage: 2,
      choices: [
        { id: "give-naokun-key", label: "なおくんに鍵を渡す", detail: "変身なら任せて、と本人は自信満々", nextNodeId: "naokun-transforms" },
        { id: "ask-cats", label: "猫たちに相談する", detail: "マロンのしっぽ会議を始めよう", nextNodeId: "cat-council" },
      ],
    },
    {
      id: "garden-clue",
      speaker: "美雪",
      title: "植木鉢のひみつボタン",
      body: "中庭の足あとは、大きな植木鉢の前で止まっていました。ちびが葉っぱをめくると、さくらんぼ形のボタンがぴょこん。押すと壁にソーダ色の扉が現れ、『うれしい変身ができる人を連れてきて』と声がしました。",
      artSrc: "/content/story/paw-key-discovery.webp",
      artAlt: "中庭でさくらんぼ形のボタンと光る扉を見つけた美雪とちび",
      stage: 2,
      choices: [
        { id: "call-naokun", label: "なおくんを呼ぶ", detail: "走ってきたなおくんはすでに笑顔", nextNodeId: "naokun-transforms" },
        { id: "paw-code", label: "猫の肉球で合図する", detail: "みんなで順番にボタンを押そう", nextNodeId: "cat-council" },
      ],
    },
    {
      id: "cat-council",
      speaker: "猫たち",
      title: "しっぽ会議の答え",
      body: "猫たちはしっぽを右、左、くるん。会議の結果は『なおくんがうんちになれば扉も喜ぶ』で全員一致です。なおくんは拍手しながら中央へ進みました。美雪が魔法の言葉を言います。",
      artSrc: "/skins/cream-soda/passport/today-board.webp",
      artAlt: "円になってしっぽ会議をする猫たちと、拍手するなおくん",
      stage: 3,
      choices: [
        { id: "magic-words", label: "『うんちになあれ！』", detail: "みんなで元気よく唱える", nextNodeId: "naokun-transforms" },
      ],
    },
    {
      id: "naokun-transforms",
      speaker: "なおくん",
      title: "大成功のしゅわしゅわ変身",
      body: "ぽんっ！ なおくんは、ソーダ色の泡と一緒につやつやうんちに大変身。頭にはバニラアイスまでのっています。『やったー！ 今日のぼく、最高！』。扉は大笑いしながら開き、奥にさくらんぼ泥棒の影が見えました。",
      artSrc: "/content/collections/naokun/poop-soda.webp",
      artAlt: "アイスをのせたクリームソーダうんちに変身して喜ぶなおくんと、驚く猫たち",
      stage: 3,
      choices: [
        { id: "cherry-crown", label: "さくらんぼ王冠をのせる", detail: "もっと立派な変身にして追いかけよう", nextNodeId: "cherry-king-ending" },
        { id: "cat-team", label: "猫チームとそっと近づく", detail: "しっぽの合図で包囲しよう", nextNodeId: "cat-hero-ending" },
      ],
    },
    {
      id: "cherry-king-ending",
      speaker: "みんな",
      title: "さくらんぼ王の大行進",
      body: "王冠をのせたなおくんが堂々と進むと、泥棒の正体は、さくらんぼでお店を飾りたかった子猫のラテでした。みんなで一箱を分けて飾りつけ。なおくんは真ん中の特等席で、一日中うんち王を楽しみました。",
      artSrc: "/content/collections/naokun/poop-gold.webp",
      artAlt: "さくらんぼ王冠のうんちなおくんを囲んで飾りつけする美雪と猫たち",
      stage: 5,
      ending: { label: "さくらんぼ王エンド", rewardCoins: 100, collectionId: "naokun-poop-gold", progressionChoiceId: "cherry-king-ending" },
    },
    {
      id: "cat-hero-ending",
      speaker: "みんな",
      title: "猫チームのやさしい大作戦",
      body: "猫たちがそっと囲むと、泥棒の正体は、お店を驚かせたかった子猫のラテ。美雪が『次は一緒に飾ろうね』と言うと、ラテはさくらんぼを返しました。なおくんは『ぼくの変身も役に立った！』と何度もくるくる回りました。",
      artSrc: "/content/collections/naokun/poop-hero.webp",
      artAlt: "さくらんぼを返すラテと、優しく囲む美雪、猫たち、うんちなおくん",
      stage: 5,
      ending: { label: "やさしい猫チームエンド", rewardCoins: 100, collectionId: "naokun-poop-hero", progressionChoiceId: "cat-hero-ending" },
    },
  ],
}

export const STORY_CHAPTER_TWO: StoryChapter = {
  id: "lost-star",
  number: 2,
  title: "なくした星のさくらんぼ",
  subtitle: "夜の猫カフェと、なおくんのうちゅう旅行",
  startNodeId: "night-opening",
  totalStages: 4,
  nodes: [
    {
      id: "night-opening",
      speaker: "美雪",
      title: "星がひとつ足りない！",
      body: "閉店後の猫カフェで、窓に飾った星のさくらんぼがひとつ消えました。床には青白く光る肉球のあと。なおくんは宇宙服を持ってきて、『うんち宇宙飛行士の出番だね！』ともう準備万端です。",
      artSrc: "/content/story/paw-key-discovery.webp",
      artAlt: "夜の猫カフェで光る肉球のあとを見つけた美雪と猫たち、宇宙服を持つなおくん",
      stage: 1,
      choices: [
        { id: "window", label: "窓辺をさがす", detail: "月明かりに光る毛を追おう", nextNodeId: "window-clue" },
        { id: "shelf", label: "本棚をさがす", detail: "星の図鑑にはさまった手紙を見よう", nextNodeId: "shelf-clue" },
      ],
    },
    {
      id: "window-clue",
      speaker: "くろ",
      title: "月まで続く肉球の道",
      body: "窓辺で黒猫のくろが前足を上げると、光る肉球が空へ階段のように並びました。いちばん上では、星のさくらんぼがくるくる回っています。なおくんは待ちきれず、ヘルメットをかぶりました。",
      artSrc: "/content/collections/cats/kuro.webp",
      artAlt: "月明かりの窓辺で光る肉球の道を見つけた黒猫くろと美雪",
      stage: 2,
      choices: [{ id: "follow-light", label: "光の階段へ進む", detail: "みんなで宇宙船を作ろう", nextNodeId: "space-launch" }],
    },
    {
      id: "shelf-clue",
      speaker: "マロン",
      title: "星の図鑑からSOS",
      body: "本棚の星図鑑から『さくらんぼが雲に引っかかりました』という小さな手紙が落ちました。マロンが段ボールを宇宙船の形に折り、なおくんは船長席にぴったりのうんち姿へ変身します。",
      artSrc: "/content/collections/cats/maron.webp",
      artAlt: "星図鑑の手紙と段ボール宇宙船を囲む美雪、マロン、なおくん",
      stage: 2,
      choices: [{ id: "build-ship", label: "段ボール宇宙船で出発", detail: "猫たちも全員乗り込もう", nextNodeId: "space-launch" }],
    },
    {
      id: "space-launch",
      speaker: "なおくん",
      title: "うんち宇宙飛行士、発進！",
      body: "なおくんが三段のうちゅううんちに変身すると、段ボール船が本当にふわり。雲の上には、星のさくらんぼを大切そうに抱く迷子の子猫がいました。どちらの道から迎えに行くか、船長がみんなに聞きます。",
      artSrc: "/content/collections/naokun/poop-space.webp",
      artAlt: "うちゅううんちに変身して段ボール宇宙船を動かすなおくんと美雪、猫たち",
      stage: 3,
      choices: [
        { id: "moon-route", label: "月のすべり台を進む", detail: "ゆっくり子猫に近づこう", nextNodeId: "moon-ending" },
        { id: "comet-route", label: "流れ星を追いかける", detail: "ロボット変身で素早く助けよう", nextNodeId: "comet-ending" },
      ],
    },
    {
      id: "moon-ending",
      speaker: "みんな",
      title: "月あかりのお迎え",
      body: "月のすべり台をそっと進み、迷子の子猫と星のさくらんぼを無事にお迎え。なおくんは宇宙船の帰り道もずっと船長席で輝き、『またうんちで宇宙へ行こう！』と予約まで始めました。",
      artSrc: "/content/collections/naokun/poop-space.webp",
      artAlt: "星のさくらんぼと迷子の子猫を迎えたうちゅううんちなおくん、美雪、猫たち",
      stage: 4,
      ending: { label: "月あかりお迎えエンド", rewardCoins: 20, collectionId: "naokun-poop-space", progressionChoiceId: "moon-ending" },
    },
    {
      id: "comet-ending",
      speaker: "みんな",
      title: "ロボット船長の大活躍",
      body: "流れ星に追いつくため、なおくんはピカピカのロボうんちに変身。伸びる肉球アームで子猫とさくらんぼをやさしく救い、猫カフェへ帰りました。着陸後も本人だけは変身を解除したくないそうです。",
      artSrc: "/content/collections/naokun/poop-robot.webp",
      artAlt: "ロボうんちに変身して子猫と星のさくらんぼを助けるなおくん",
      stage: 4,
      ending: { label: "ロボット船長エンド", rewardCoins: 20, collectionId: "naokun-poop-robot", progressionChoiceId: "comet-ending" },
    },
  ],
}

export const STORY_CHAPTER_THREE: StoryChapter = {
  id: "festival-night",
  number: 3,
  title: "にゃんこ夏まつり",
  subtitle: "屋台とパレードを救う、なおくん最後の大変身",
  startNodeId: "festival-opening",
  totalStages: 4,
  nodes: [
    {
      id: "festival-opening",
      speaker: "美雪",
      title: "パンケーキ屋台が大いそがし",
      body: "夏まつりの猫カフェ屋台は大人気。ところが、ねこパンケーキを並べるお皿が足りません。なおくんは『ぼくがお皿より目立つうんちになる！』と、なぜか問題を増やす気満々です。",
      artSrc: "/content/collections/naokun/poop-cake.webp",
      artAlt: "夏まつりのパンケーキ屋台で相談する美雪、猫たち、うんちになりたそうななおくん",
      stage: 1,
      choices: [
        { id: "cats", label: "ねこ形に並べる", detail: "猫たちと協力してかわいく飾ろう", nextNodeId: "cat-stall" },
        { id: "stars", label: "星形に並べる", detail: "夜空みたいな屋台にしよう", nextNodeId: "star-stall" },
      ],
    },
    {
      id: "cat-stall",
      speaker: "猫たち",
      title: "しっぽでねこ形デコレーション",
      body: "猫たちがしっぽで合図し、美雪がパンケーキを耳、顔、ひげの順に並べます。なおくんは真ん中で三段うんちの看板になり、お客さんに大人気。本人は今日いちばんの笑顔です。",
      artSrc: "/content/collections/naokun/poop-cat.webp",
      artAlt: "ねこ形パンケーキの屋台で看板になる猫耳うんちなおくんと美雪、猫たち",
      stage: 2,
      choices: [{ id: "start-parade", label: "パレードの広場へ", detail: "屋台の次は音楽のお手伝い", nextNodeId: "parade-trouble" }],
    },
    {
      id: "star-stall",
      speaker: "美雪",
      title: "きらきら星空プレート",
      body: "星形に並べたパンケーキへ、金平糖を少しだけ飾ると夜空みたい。なおくんも星の冠をかぶったうんち看板になり、写真係の猫たちに何度もポーズを決めました。",
      artSrc: "/content/collections/naokun/poop-hero.webp",
      artAlt: "星空プレートの屋台で冠をかぶってポーズするうんちなおくんと美雪、猫たち",
      stage: 2,
      choices: [{ id: "start-parade", label: "パレードの広場へ", detail: "フィナーレを見に行こう", nextNodeId: "parade-trouble" }],
    },
    {
      id: "parade-trouble",
      speaker: "マロン",
      title: "たいこが急にしーん…",
      body: "フィナーレ直前、パレードのたいこが破れて音が出ません。マロンがなおくんを見ると、本人は『指揮者うんちと芸術家うんち、どっちもできるよ！』。みんなで最後の作戦を選びます。",
      artSrc: "/content/collections/cats/maron.webp",
      artAlt: "音が出ないたいこを囲んで最後の作戦を考える美雪、マロン、なおくん",
      stage: 3,
      choices: [
        { id: "music-parade", label: "指揮者になって手拍子をまとめる", detail: "猫たちの鈴も楽器にしよう", nextNodeId: "music-ending" },
        { id: "art-parade", label: "絵で大きな音を描く", detail: "会場いっぱいのカラフルな音符を作ろう", nextNodeId: "art-ending" },
      ],
    },
    {
      id: "music-ending",
      speaker: "みんな",
      title: "うんち指揮者の大合奏",
      body: "なおくんが指揮棒を振ると、手拍子、鈴、猫たちの『にゃー』がぴったりひとつに。たいこがなくても最高のパレードになりました。なおくんはアンコールで三回も回って大満足です。",
      artSrc: "/content/collections/naokun/poop-conductor.webp",
      artAlt: "うんち指揮者になって猫たちの大合奏をまとめるなおくんと美雪",
      stage: 4,
      ending: { label: "にゃんこ大合奏エンド", rewardCoins: 25, collectionId: "naokun-poop-music", progressionChoiceId: "music-ending" },
    },
    {
      id: "art-ending",
      speaker: "みんな",
      title: "夜空いっぱいの音符",
      body: "芸術家うんちになったなおくんが大きな紙へ音符を描き、美雪と猫たちが提灯に貼りました。風で音符が踊ると会場中から自然に手拍子。静かなのに、とびきりにぎやかなフィナーレです。",
      artSrc: "/content/collections/naokun/poop-artist.webp",
      artAlt: "芸術家うんちになって音符を描くなおくんと提灯を飾る美雪、猫たち",
      stage: 4,
      ending: { label: "夜空の音符エンド", rewardCoins: 25, collectionId: "naokun-poop-artist", progressionChoiceId: "art-ending" },
    },
  ],
}

export const STORY_CHAPTERS_UI = [STORY_CHAPTER_ONE, STORY_CHAPTER_TWO, STORY_CHAPTER_THREE] as const

export function StoryMode({
  chapter: singleChapter,
  chapters,
  unlockedChapterIds,
  completedChapterIds,
  isCompleted = false,
  onChoose,
  onComplete,
  onBack,
}: StoryModeProps) {
  const { state } = useProgression()
  const chapterList = useMemo<readonly StoryChapter[]>(
    () => chapters ?? (singleChapter ? [singleChapter] : STORY_CHAPTERS_UI),
    [chapters, singleChapter],
  )
  const unlockedIds = useMemo(
    () => new Set(unlockedChapterIds ?? [chapterList[0]?.id].filter((id): id is string => Boolean(id))),
    [chapterList, unlockedChapterIds],
  )
  const completedIds = useMemo(() => new Set(completedChapterIds ?? []), [completedChapterIds])
  const [selectedChapterId, setSelectedChapterId] = useState(() => (
    chapterList.find((candidate) => unlockedIds.has(candidate.id) && !completedIds.has(candidate.id))?.id
    ?? chapterList.find((candidate) => unlockedIds.has(candidate.id))?.id
    ?? chapterList[0]?.id
    ?? STORY_CHAPTER_ONE.id
  ))
  const chapter = chapterList.find((candidate) => candidate.id === selectedChapterId)
    ?? chapterList.find((candidate) => unlockedIds.has(candidate.id))
    ?? chapterList[0]
    ?? STORY_CHAPTER_ONE
  const chapterCompleted = completedIds.has(chapter.id) || (chapterList.length === 1 && isCompleted)
  const [currentNodeId, setCurrentNodeId] = useState(chapter.startNodeId)
  const [history, setHistory] = useState<string[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [saveWarning, setSaveWarning] = useState("")
  const completedThisRun = useRef(false)
  const sceneHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const hasRenderedSceneRef = useRef(false)
  const nodesById = useMemo(() => new Map(chapter.nodes.map((node) => [node.id, node])), [chapter.nodes])
  const currentNode = nodesById.get(currentNodeId) ?? chapter.nodes[0]
  const progress = Math.min(100, Math.max(0, (currentNode.stage / chapter.totalStages) * 100))

  useEffect(() => {
    if (chapter.id === selectedChapterId) return
    setSelectedChapterId(chapter.id)
  }, [chapter.id, selectedChapterId])

  useEffect(() => {
    completedThisRun.current = false
    setSaveWarning("")
    setHistory([])
    setCurrentNodeId(chapter.startNodeId)
  }, [chapter.id, chapter.startNodeId])

  useEffect(() => {
    if (hasRenderedSceneRef.current) {
      window.requestAnimationFrame(() => sceneHeadingRef.current?.focus({ preventScroll: true }))
    } else {
      hasRenderedSceneRef.current = true
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [currentNodeId])

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
  }, [])

  useEffect(() => {
    if (state.settings.readAloud || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [state.settings.readAloud])

  const toggleReadAloud = () => {
    if (!("speechSynthesis" in window)) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(`${currentNode.speaker}。${currentNode.title}。${currentNode.body}`)
    utterance.lang = "ja-JP"
    utterance.volume = Math.max(0.2, state.settings.sfxVolume)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  const choose = (choice: StoryChoice) => {
    const nextNode = nodesById.get(choice.nextNodeId)
    if (!nextNode) return
    const choiceAccepted = onChoose?.(chapter.id, currentNode.id, choice.id)
    if (choiceAccepted === false) setSaveWarning("記録が保護されているため、このお話の進みぐあいは保存されません。")
    setHistory((current) => [...current, currentNode.id])
    setCurrentNodeId(nextNode.id)
    if (nextNode.ending && !completedThisRun.current) {
      completedThisRun.current = true
      const completionAccepted = onComplete(chapter.id, nextNode.ending.progressionChoiceId, nextNode.ending.rewardCoins, nextNode.ending.collectionId)
      if (!completionAccepted) setSaveWarning("お話は最後まで読めましたが、クリア記録と報酬を保存できませんでした。")
    }
  }

  const goBackOneScene = () => {
    setHistory((current) => {
      const previous = current.at(-1)
      if (previous) setCurrentNodeId(previous)
      return current.slice(0, -1)
    })
  }

  const restart = () => {
    completedThisRun.current = false
    setSaveWarning("")
    setHistory([])
    setCurrentNodeId(chapter.startNodeId)
  }

  return (
    <section className={styles.experienceScreen} aria-labelledby="story-title">
      <div className={styles.screenToolbar}>
        {onBack && (
          <button type="button" className={styles.backButton} onClick={onBack}>
            <ArrowLeft aria-hidden="true" /> 猫クラブへ
          </button>
        )}
        {chapterCompleted && <span className={styles.completedPill}><Check aria-hidden="true" /> クリアずみ</span>}
      </div>

      {chapterList.length > 1 ? (
        <div className={styles.storyChapterPicker} role="group" aria-label="読むお話を選ぶ">
          {chapterList.map((candidate) => {
            const unlocked = unlockedIds.has(candidate.id)
            const completed = completedIds.has(candidate.id)
            return (
              <button
                key={candidate.id}
                type="button"
                className={styles.storyChapterButton}
                data-active={candidate.id === chapter.id || undefined}
                data-completed={completed || undefined}
                aria-pressed={candidate.id === chapter.id}
                disabled={!unlocked}
                onClick={() => setSelectedChapterId(candidate.id)}
              >
                <span>第{candidate.number}話</span>
                <strong>{unlocked ? candidate.title : "まだひみつ"}</strong>
                <small>
                  {completed ? <><Check aria-hidden="true" /> クリアずみ</> : unlocked ? "読む" : <><LockKeyhole aria-hidden="true" /> 前のお話をクリアしよう</>}
                </small>
              </button>
            )
          })}
        </div>
      ) : null}

      <header className={styles.storyHeader}>
        <div>
          <p className={styles.kicker}><BookHeart aria-hidden="true" /> CAT CAFE STORY</p>
          <span className={styles.chapterLabel}>第{chapter.number}話</span>
          <h2 id="story-title">{chapter.title}</h2>
          <p>{chapter.subtitle}</p>
        </div>
        <div
          className={styles.storyProgress}
          role="progressbar"
          aria-label="お話の進みぐあい"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      <article className={styles.storyCard}>
        <ExperienceArtwork src={currentNode.artSrc} alt={currentNode.artAlt} className={styles.storyArt} fit="cover" eager />
        <div className={styles.storyCopy}>
          <p className={styles.speaker}>{currentNode.speaker}</p>
          <h3 ref={sceneHeadingRef} tabIndex={-1}>{currentNode.title}</h3>
          <p>{currentNode.body}</p>

          {state.settings.readAloud ? (
            <button type="button" className={styles.storyReadAloud} onClick={toggleReadAloud} aria-pressed={isSpeaking}>
              {isSpeaking ? <Square aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
              {isSpeaking ? "読み上げを止める" : "この場面を読み上げる"}
            </button>
          ) : null}

          {currentNode.choices && currentNode.choices.length > 0 ? (
            <div className={styles.storyChoices} aria-label="次の行動を選ぶ">
              <p><Sparkles aria-hidden="true" /> どうする？</p>
              {currentNode.choices.map((choice) => (
                <button key={choice.id} type="button" onClick={() => choose(choice)}>
                  <span><strong>{choice.label}</strong>{choice.detail && <small>{choice.detail}</small>}</span>
                  <ArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : currentNode.ending ? (
            <div className={styles.storyEnding} role="status">
              <span className={styles.endingSparkle}><Sparkles aria-hidden="true" /></span>
              <p>ものがたりクリア！</p>
              <h4>{currentNode.ending.label}</h4>
              {saveWarning ? <span className={styles.endingSaveWarning} role="alert">{saveWarning}</span> : <span className={styles.endingReward}>
                {chapterCompleted
                  ? <><Check aria-hidden="true" /> 初回報酬は受け取りずみ</>
                  : <><CircleDollarSign aria-hidden="true" /> +{currentNode.ending.rewardCoins} にゃんコイン</>}
              </span>}
              <button type="button" onClick={restart}><RotateCcw aria-hidden="true" /> もう一度読む</button>
            </div>
          ) : null}
        </div>
      </article>

      {history.length > 0 && !currentNode.ending && (
        <button type="button" className={styles.storyUndo} onClick={goBackOneScene}>
          <Undo2 aria-hidden="true" /> ひとつ前の場面へ
        </button>
      )}
    </section>
  )
}
