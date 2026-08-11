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
      body: "開店前の猫カフェ。飾り用のさくらんぼが、一箱まるごと消えていました。床には小さな肉球と、なぜか三段の茶色いスタンプ。私が『この足あと、なおくんみたい』と言うと、本人は『まだ変身前だよ。残念！』。残念なのはそこなの？",
      artSrc: "/content/story/cafe-opening.webp",
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
      body: "キッチンでは、だれも触っていない泡立て器がくるくる。マロンが前足で止めると、空っぽのボウルからソーダ色の鍵がころん。札には『うれしい変身ができる人だけ』。なおくんが胸を張りすぎて、後ろの猫全員に首をかしげられました。",
      artSrc: "/content/story/kitchen-key.webp",
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
      body: "中庭の足あとは、大きな植木鉢の前でぴたり。ちびが葉っぱをめくると、さくらんぼ形のボタンがぴょこん。押すと壁にソーダ色の扉が現れ、『うれしい変身ができる人を』。なおくんはまだ呼んでいないのに、植木鉢の陰から『はい！』と出てきました。",
      artSrc: "/content/story/garden-door.webp",
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
      body: "猫たちはしっぽを右、左、くるん。会議の答えは『なおくんが、きれいな魔法のうんち型マスコットになれば扉も笑う』で全員一致。なおくんだけ立ち上がって拍手し、マロンに『会議中です』の札を向けられました。では、魔法の言葉をどうぞ。",
      artSrc: "/content/story/tail-council.webp",
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
      body: "ぽんっ！ なおくんは、ソーダ色の泡から生まれた、ぴかぴか三段うんち型マスコットに大変身。頭の飾りはバニラアイスそっくりですが食べられません。『今日のぼく、百点！』。扉は笑いすぎて自動で開き、奥で子猫のしっぽがびくっ。",
      artSrc: "/content/story/soda-transform.webp",
      artAlt: "バニラアイス風の撮影用帽子をかぶったクリームソーダうんちに変身して喜ぶなおくんと、驚く猫たち",
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
      body: "王冠をのせたなおくんが堂々と進むと、泥棒の正体は、お店を驚かせたかった子猫のラテ。さくらんぼを返して、みんなで飾りつけ直しました。なおくんは食べものから離れた撮影台で一日うんち王。王さまの最初の命令は『もっと拍手！』でした。",
      artSrc: "/content/story/cherry-king-ending.webp",
      artAlt: "さくらんぼ王冠のうんちなおくんを囲んで飾りつけする美雪と猫たち",
      stage: 5,
      ending: { label: "さくらんぼ王エンド", rewardCoins: 100, collectionId: "naokun-poop-gold", progressionChoiceId: "cherry-king-ending" },
    },
    {
      id: "cat-hero-ending",
      speaker: "みんな",
      title: "猫チームのやさしい大作戦",
      body: "猫たちがそっと囲むと、泥棒の正体は、お店を驚かせたかった子猫のラテ。私が『次は一緒に飾ろうね』と言うと、ラテはさくらんぼを返しました。なおくんは『ぼくも名探偵？』。マロンの判定は『扉を笑わせた係』。本人はそれでも大喜びです。",
      artSrc: "/content/story/cat-team-ending.webp",
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
      body: "閉店後、窓飾りの星のさくらんぼがひとつ消えました。床には青白く光る肉球のあと。なおくんは頼んでもいない宇宙ヘルメットを持ってきて、『うんち宇宙飛行士の出番だね！』。私はまだ『事件です』しか言っていません。",
      artSrc: "/content/story/night-opening.webp",
      artAlt: "夜の猫カフェで光る肉球のあとを見つけた美雪と猫たち、宇宙服を持つなおくん",
      stage: 1,
      choices: [
        { id: "window", label: "窓辺をさがす", detail: "月明かりに光る毛を追おう", nextNodeId: "window-clue" },
        { id: "shelf", label: "本棚をさがす", detail: "星の図鑑にはさまった手紙を見よう", nextNodeId: "shelf-clue" },
      ],
    },
    {
      id: "window-clue",
      speaker: "クロ",
      title: "月まで続く肉球の道",
      body: "窓辺で黒猫のクロが前足を上げると、光る肉球が空へ階段のように並びました。いちばん上では、星のさくらんぼがくるくる。なおくんは待ちきれずヘルメットを逆さにかぶり、クロに無言で直されました。宇宙へ行く前から不安です。",
      artSrc: "/content/story/moon-paw-road.webp",
      artAlt: "月明かりの窓辺で光る肉球の道を見つけた黒猫クロと美雪、ヘルメットを逆さにかぶるなおくん",
      stage: 2,
      choices: [{ id: "follow-light", label: "光の階段へ進む", detail: "みんなで宇宙船を作ろう", nextNodeId: "space-launch" }],
    },
    {
      id: "shelf-clue",
      speaker: "マロン",
      title: "星の図鑑からSOS",
      body: "星図鑑から『さくらんぼが雲に引っかかりました』という手紙がひらり。マロンが段ボールを宇宙船に折る間、なおくんは船長の練習を開始。『右へ！ 左へ！ ぼくを三段に！』。最後の指示だけ、乗組員全員に却下されませんでした。",
      artSrc: "/content/story/star-book-sos.webp",
      artAlt: "星図鑑の手紙と段ボール宇宙船を囲む美雪、マロン、なおくん",
      stage: 2,
      choices: [{ id: "build-ship", label: "段ボール宇宙船で出発", detail: "猫たちも全員乗り込もう", nextNodeId: "space-launch" }],
    },
    {
      id: "space-launch",
      speaker: "なおくん",
      title: "うんち宇宙飛行士、発進！",
      body: "なおくんが、きれいな魔法の三段うんち宇宙飛行士に変身すると、段ボール船が本当にふわり。雲の上には、星のさくらんぼを抱く迷子の子猫。船長が『どっちへ行く？』と聞いた直後、無重力で逆さまに。猫たちは冷静に作戦を選びます。",
      artSrc: "/content/story/space-launch.webp",
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
      body: "月のすべり台をそっと進み、迷子の子猫と星のさくらんぼを無事にお迎え。帰り道、なおくんは『次の宇宙うんち便は明日！』と予約受付を開始。お客さん第一号はマロン、行き先は『いつもの猫ベッド』でした。宇宙、関係ないよね。",
      artSrc: "/content/story/moon-rescue-ending.webp",
      artAlt: "星のさくらんぼと迷子の子猫を迎えたうちゅううんちなおくん、美雪、猫たち",
      stage: 4,
      ending: { label: "月あかりお迎えエンド", rewardCoins: 20, collectionId: "naokun-poop-space", progressionChoiceId: "moon-ending" },
    },
    {
      id: "comet-ending",
      speaker: "みんな",
      title: "ロボット船長の大活躍",
      body: "流れ星に追いつくため、なおくんはピカピカのロボうんちに追加変身。伸びる肉球アームで子猫とさくらんぼをやさしく救いました。着陸後、解除ボタンを押すと『まだです』の音声。押しているのは、もちろん本人です。",
      artSrc: "/content/story/robot-rescue-ending.webp",
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
      body: "夏まつりの猫カフェ屋台は大人気。最初のお皿は用意できたのに、ねこ形と星形のどちらに並べるか、屋台の看板もまだ決まりません。なおくんは食べものから離れた撮影台で『どっちでも、ぼくが一番目立つうんち看板になる！』と、もう決め顔。私たちは並べ方を考え、猫たちは看板係の顔を見て首をかしげています。",
      artSrc: "/content/story/festival-stall.webp",
      artAlt: "夏まつりの屋台で最初のお皿を前に並べ方を相談する美雪と猫たち、離れた撮影台でうんち看板のポーズをするなおくん",
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
      body: "猫たちがしっぽで合図し、私がパンケーキを耳、顔、ひげの順に並べます。なおくんは食べものから十分離れた撮影台で、きれいな魔法の猫みみうんち看板に。『にゃお』と言うたび、猫先生たちから鳴き方のやり直しが入ります。",
      artSrc: "/content/story/cat-stall.webp",
      artAlt: "ねこ形パンケーキの屋台から離れた撮影台で看板になる猫耳うんちなおくんと、美雪、猫たち",
      stage: 2,
      choices: [{ id: "start-parade", label: "パレードの広場へ", detail: "屋台の次は音楽のお手伝い", nextNodeId: "parade-trouble" }],
    },
    {
      id: "star-stall",
      speaker: "美雪",
      title: "きらきら星空プレート",
      body: "星形に並べたパンケーキは夜空みたい。なおくんも屋台から離れた撮影台で、星の冠をかぶった三段うんち看板に変身しました。写真係のソラが一枚撮るたび、なおくんは別の決め顔。顔はひとつしかないのに十二種類あります。",
      artSrc: "/content/story/star-stall.webp",
      artAlt: "星空プレートの屋台から離れた撮影台で冠をかぶってポーズするうんちなおくんと、美雪、猫たち",
      stage: 2,
      choices: [{ id: "start-parade", label: "パレードの広場へ", detail: "フィナーレを見に行こう", nextNodeId: "parade-trouble" }],
    },
    {
      id: "parade-trouble",
      speaker: "マロン",
      title: "たいこが急にしーん…",
      body: "フィナーレ直前、パレードのたいこが破れて、しーん。マロンがなおくんを見ると、本人は指揮棒とベレー帽を両方装備済み。『指揮者うんちと芸術家うんち、どっち？』。準備が早いというより、ずっと待っていた顔です。",
      artSrc: "/content/story/parade-trouble.webp",
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
      body: "音楽指揮者うんちになったなおくんが指揮棒を振ると、手拍子、鈴、猫たちの『にゃー』がぴったりひとつに。アンコールで三回転したら、自分だけ四拍おくれて止まりました。最後の『にゃー』は、転びそうな指揮者への応援です。",
      artSrc: "/content/story/music-ending.webp",
      artAlt: "うんち指揮者になって猫たちの大合奏をまとめるなおくんと美雪",
      stage: 4,
      ending: { label: "にゃんこ大合奏エンド", rewardCoins: 25, collectionId: "naokun-poop-music", progressionChoiceId: "music-ending" },
    },
    {
      id: "art-ending",
      speaker: "みんな",
      title: "夜空いっぱいの音符",
      body: "芸術家うんちになったなおくんが大きな紙へ音符を描き、私と猫たちが提灯に貼りました。風で音符が踊ると会場中から手拍子。なおくんの自画像だけは、どう見ても茶色いソフトクリーム。本人は『そっくり！』と大満足です。",
      artSrc: "/content/story/art-ending.webp",
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
              <p>事件ファイル完了</p>
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
