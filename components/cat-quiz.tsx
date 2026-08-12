"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowRight, BrainCircuit, CheckCircle, Clock3, Play, RotateCcw, Sparkles, Star, Timer, Trophy, XCircle } from "lucide-react"
import { isFiniteNumberRecord, useLocalStorage } from "@/hooks/use-local-storage"
import { GamePrimaryButton, GameShell, GameStat } from "@/components/game-shell"
import { useProgression } from "@/components/progression-provider"
import { createEventId } from "@/lib/progression"
import {
  CONTENT_OVERRIDE_APPLIED_KEY,
  getContentOverrideStorage,
  readContentOverrides,
  type QuizContentOverride,
} from "@/lib/content-overrides"

type QuizGameState = "idle" | "playing" | "finished"
type GlobalDifficulty = "gentle" | "standard" | "challenge"
type QuestionCount = 5 | 10

export function getActualQuizQuestionCount(requested: number, available: number) {
  if (!Number.isFinite(requested) || !Number.isFinite(available)) return 0
  return Math.max(0, Math.min(Math.floor(requested), Math.floor(available)))
}

type QuizQuestion = {
  question: string
  options: [string, string, string, string]
  correctAnswer: string
  explanation?: string
}

const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // 猫の体・行動・ことば
  {
    question: "猫が甘いものを感じられないのはなぜ？",
    options: ["舌が小さいから", "甘味の受容体がないから", "甘いものが嫌いだから", "鼻が効きすぎるから"],
    correctAnswer: "甘味の受容体がないから",
  },
  {
    question: "猫の集団のことを英語で何と呼ぶ？",
    options: ["A pack", "A herd", "A clowder", "A school"],
    correctAnswer: "A clowder",
  },
  {
    question: "猫が喉をゴロゴロ鳴らすのは、どんな時？",
    options: ["満足している時だけ", "不安な時だけ", "骨折を治すため", "満足な時も不安な時も"],
    correctAnswer: "満足な時も不安な時も",
  },
  {
    question: "猫のひげの平均的な本数は、片側で何本？",
    options: ["約5本", "約12本", "約20本", "約30本"],
    correctAnswer: "約12本",
  },
  {
    question: "猫が飼い主をゆっくりと瞬きするのは、どんな意味？",
    options: ["眠い", "敵意がない、信頼の証", "目が疲れている", "獲物を狙っている"],
    correctAnswer: "敵意がない、信頼の証",
  },
  {
    question: "大きな体と、耳先のふさふさした毛で知られる猫の品種は？",
    options: ["メインクーン", "シャム", "スフィンクス", "マンチカン"],
    correctAnswer: "メインクーン",
  },
  {
    question: "猫の鎖骨はどうなっている？",
    options: ["人間と同じ形", "とても太い", "存在しない", "体に埋まっている"],
    correctAnswer: "体に埋まっている",
  },
  {
    question: "猫が自分の身長の何倍までジャンプできる？",
    options: ["約2倍", "約3倍", "約5倍", "約10倍"],
    correctAnswer: "約5倍",
  },
  {
    question: "猫がマタタビに反応する原因となる成分は？",
    options: ["マタタビン", "ネペタラクトール", "カプサイシン", "カフェイン"],
    correctAnswer: "ネペタラクトール",
  },
  {
    question: "猫の平熱は、人間と比べてどう？",
    options: ["同じくらい", "低い", "高い", "季節によって変わる"],
    correctAnswer: "高い",
  },
  {
    question: "猫の「フレーメン反応」とは、何をしている時？",
    options: ["怒っている時", "獲物を見つけた時", "匂いを詳しく分析している時", "眠い時"],
    correctAnswer: "匂いを詳しく分析している時",
  },
  {
    question: "三毛猫のオスが非常に珍しい理由は何？",
    options: ["体が弱いから", "毛の色を決める遺伝子が性染色体上にあるから", "メスに人気がないから", "模様が複雑だから"],
    correctAnswer: "毛の色を決める遺伝子が性染色体上にあるから",
  },
  {
    question: "猫が箱や狭い場所に入りたがるのはなぜ？",
    options: ["体が柔らかいから", "暗い場所が好きだから", "安心できるから", "ただの遊び"],
    correctAnswer: "安心できるから",
  },
  {
    question: "猫の「肉球」の主な役割でないものはどれ？",
    options: ["汗をかく", "滑り止め", "獲物を捕まえる", "衝撃を吸収する"],
    correctAnswer: "獲物を捕まえる",
  },
  {
    question: "猫の目が暗闇で光って見えるのはなぜ？",
    options: ["目に電気があるから", "網膜の後ろにあるタペタムが光を反射するから", "目が大きいから", "水晶体が光るから"],
    correctAnswer: "網膜の後ろにあるタペタムが光を反射するから",
  },
  {
    question: "猫が前足でふみふみする行動の由来は？",
    options: ["ストレッチ", "子猫が母乳を飲むときの名残", "マーキング", "飼い主への愛情表現"],
    correctAnswer: "子猫が母乳を飲むときの名残",
  },
  {
    question: "「猫に小判」ということわざの意味は？",
    options: ["猫は賢い", "価値のわからない人に貴重なものを与えても無駄", "猫は小判が好き", "猫は金運を呼ぶ"],
    correctAnswer: "価値のわからない人に貴重なものを与えても無駄",
  },
  {
    question: "猫がよく毛づくろいをする一番の理由は何？",
    options: ["体を清潔に保つため", "暇だから", "飼い主にかまってほしいから", "毛並みを整えるため"],
    correctAnswer: "体を清潔に保つため",
  },
  {
    question: "人と猫では、より高い音まで聞き取れるのはどちら？",
    options: ["人", "猫", "どちらも同じ", "どちらも高い音は聞こえない"],
    correctAnswer: "猫",
  },
  // 猫の歴史・品種・科学
  {
    question: "猫の視野は、約何度あると言われている？",
    options: ["約120度", "約180度", "約200度", "約360度"],
    correctAnswer: "約200度",
  },
  {
    question: "宇宙に行った最初の猫の名前は何？",
    options: ["ライカ", "フェリセット", "ミスター・ビッグルワース", "ソックス"],
    correctAnswer: "フェリセット",
  },
  {
    question: "ほとんどの猫の指の数は、合計で何本？",
    options: ["16本", "18本", "20本", "22本"],
    correctAnswer: "18本",
  },
  {
    question: "子猫の集団のことを、特に何と呼ぶ？",
    options: ["ア・キンドル", "ア・ギャング", "ア・スクール", "ア・ファミリー"],
    correctAnswer: "ア・キンドル",
  },
  {
    question: "古代、猫を神聖な動物として崇拝していた文明はどこ？",
    options: ["古代ローマ", "古代ギリシャ", "古代エジプト", "古代中国"],
    correctAnswer: "古代エジプト",
  },
  {
    question: "イエネコの学名は何？",
    options: ["Panthera leo", "Canis lupus", "Felis catus", "Mus musculus"],
    correctAnswer: "Felis catus",
  },
  {
    question: "猫のゴロゴロ音が骨の回復を助けるという説は、今どう考えればいい？",
    options: ["必ず骨を治せる", "まだ研究中で、断定はできない", "完全な作り話", "どの動物にも同じ効果がある"],
    correctAnswer: "まだ研究中で、断定はできない",
  },
  {
    question: "猫好きの人を指す言葉は何？",
    options: ["愛猫家（アイビョウカ）", "愛犬家（アイケンカ）", "愛鳥家（アイチョウカ）", "愛魚家（アイギョカ）"],
    correctAnswer: "愛猫家（アイビョウカ）",
  },
  {
    question: "猫が顔をこすりつけてくる主な理由は何？",
    options: ["顔がかゆいから", "愛情表現", "自分の匂いをつけるマーキング行動", "甘えているだけ"],
    correctAnswer: "自分の匂いをつけるマーキング行動",
  },
  {
    question: "室内飼いの猫の平均寿命は、およそ何年？",
    options: ["5～8年", "8～12年", "12～18年", "20年以上"],
    correctAnswer: "12～18年",
  },
  {
    question: "「ヘミングウェイの猫」として知られる、指の数が多い猫を何と呼ぶ？",
    options: ["多指症の猫", "幸運の猫", "六本指の猫", "賢い猫"],
    correctAnswer: "多指症の猫",
  },
  {
    question: "猫は「完全肉食動物」です。これはどういう意味？",
    options: ["肉しか食べられない", "肉を最も好む", "生きるために動物性タンパク質が不可欠", "野菜を食べると病気になる"],
    correctAnswer: "生きるために動物性タンパク質が不可欠",
  },
  {
    question: "猫の妊娠期間は、およそどのくらい？",
    options: ["約1ヶ月", "約2ヶ月", "約3ヶ月", "約4ヶ月"],
    correctAnswer: "約2ヶ月",
  },
  {
    question: "『不思議の国のアリス』に登場する、ニヤニヤ笑う猫の名前は何？",
    options: ["トムキャット", "フィガロ", "チェシャ猫", "ダイナ"],
    correctAnswer: "チェシャ猫",
  },
  {
    question: "猫がしっぽをピンと立てている時、どんな気持ち？",
    options: ["怒っている", "怖がっている", "友好的な挨拶、嬉しい", "警戒している"],
    correctAnswer: "友好的な挨拶、嬉しい",
  },
  {
    question: "世界最古のペットの猫の骨が見つかった場所はどこ？",
    options: ["エジプト", "ギリシャ", "キプロス島", "日本"],
    correctAnswer: "キプロス島",
  },
  {
    question: "猫が獲物を見つけた時に「カカカッ」と鳴く行動を何と呼ぶ？",
    options: ["クラッキング", "チャタリング", "グルーミング", "マーキング"],
    correctAnswer: "チャタリング",
  },
  {
    question: "猫の鼻にある模様のことを何と呼ぶ？",
    options: ["ノーズマーク", "鼻紋（びもん）", "ハナパターン", "キャットスポット"],
    correctAnswer: "鼻紋（びもん）",
  },
  {
    question: "猫の耳の付け根にある袋状の皮膚の部分の名前は何？",
    options: ["ヘンリーのポケット", "猫袋（ねこぶくろ）", "イヤーポーチ", "聴覚ポケット"],
    correctAnswer: "ヘンリーのポケット",
  },
  {
    question: "猫が液体のように狭い場所を通り抜けられる理由の一つは何？",
    options: [
      "骨がとても柔らかいから",
      "鎖骨が体に固定されていないから",
      "体がゼリーでできているから",
      "筋肉が特殊だから",
    ],
    correctAnswer: "鎖骨が体に固定されていないから",
  },
  // 猫の体・成長・お世話
  {
    question: "成猫の永久歯は、全部で何本？",
    options: ["20本", "26本", "30本", "36本"],
    correctAnswer: "30本",
    explanation: "子猫の乳歯は26本ですが、生え替わった成猫の永久歯は30本です。",
  },
  {
    question: "生まれたばかりの子猫の歯は、どうなっている？",
    options: ["見える歯はまだない", "乳歯が26本そろっている", "永久歯が30本そろっている", "犬歯だけ生えている"],
    correctAnswer: "見える歯はまだない",
    explanation: "子猫は見える歯がない状態で生まれ、乳歯は生後3週ごろから生え始めます。",
  },
  {
    question: "子猫の目は、生まれた直後どうなっている？",
    options: ["閉じている", "大人と同じように見える", "片目だけ開いている", "暗い所だけ見える"],
    correctAnswer: "閉じている",
    explanation: "子猫は目を閉じた状態で生まれ、多くは生後7～10日ごろから開き始めます。",
  },
  {
    question: "子猫が人や動物、生活音に慣れやすい『社会化期』は、およそいつ？",
    options: ["生後2～7週", "生後3～6か月", "1～2歳", "5歳以降"],
    correctAnswer: "生後2～7週",
    explanation: "生後2～7週ごろは、安心できる経験を通して人や環境に慣れやすい大切な時期です。怖がる体験を無理にさせる時期ではありません。",
  },
  {
    question: "猫の『第三眼瞼（だいさんがんけん）』は、どこにある？",
    options: ["目の内側", "耳の奥", "鼻の中", "舌の下"],
    correctAnswer: "目の内側",
    explanation: "第三眼瞼は『第三のまぶた』とも呼ばれ、目の表面を守ったり、うるおいを保ったりします。",
  },
  {
    question: "猫のひげが感じ取るものは何？",
    options: ["空気の流れや近くの物の動き", "食べ物の甘さ", "遠くの色", "地面の温度だけ"],
    correctAnswer: "空気の流れや近くの物の動き",
    explanation: "ひげは根元に神経が集まった感覚器。空気のわずかな動きから、近くの物の大きさや位置を知る助けになります。",
  },
  {
    question: "猫が汗をかく主な場所はどこ？",
    options: ["肉球", "背中", "しっぽ", "ひげ"],
    correctAnswer: "肉球",
    explanation: "猫が汗を出せる主な場所は足裏の肉球です。暑い時は汗だけでなく、涼しい場所へ移動するなどして体温を調節します。",
  },
  {
    question: "猫の舌がざらざらしているのは、表面に何があるから？",
    options: ["角質化した乳頭", "小さな歯", "細い骨", "砂の粒"],
    correctAnswer: "角質化した乳頭",
    explanation: "舌には角質化した硬い乳頭（にゅうとう）が並び、毛づくろいや食べ物を口の奥へ運ぶのに役立ちます。",
  },
  {
    question: "猫が怖がっている時に見られやすい姿はどれ？",
    options: ["耳を伏せ、しっぽを体へ寄せる", "しっぽを立てて近づく", "お腹を出して眠る", "目を細めてふみふみする"],
    correctAnswer: "耳を伏せ、しっぽを体へ寄せる",
    explanation: "耳を横や後ろへ伏せる、体を低くする、しっぽを巻き込む動きは恐怖のサイン。追いかけず、離れられる場所を用意します。",
  },
  {
    question: "猫が爪とぎをする理由として正しいものはどれ？",
    options: ["縄張りの印を残し、爪の外側を整える", "飼い主を困らせる", "歯を強くする", "眠気をなくす"],
    correctAnswer: "縄張りの印を残し、爪の外側を整える",
    explanation: "爪とぎは、足裏の匂いや傷跡で印を残し、古い爪のさやを外す自然な行動です。安定した爪とぎを用意します。",
  },
  {
    question: "猫の『爪除去手術』は、実際には何をする手術？",
    options: ["爪先の骨ごと切除する", "伸びた爪だけを短くする", "爪にカバーを付ける", "爪を一時的に引っ込める"],
    correctAnswer: "爪先の骨ごと切除する",
    explanation: "爪除去は爪だけを抜く処置ではなく、指先の骨を切除する手術です。通常の爪とぎ行動には、爪とぎ器などで対応します。",
  },
  {
    question: "猫を動物病院などへ安全に運ぶ方法はどれ？",
    options: ["丈夫で閉まるキャリーに入れる", "腕に抱いたまま歩く", "車内で自由にさせる", "段ボールのふたを開けて運ぶ"],
    correctAnswer: "丈夫で閉まるキャリーに入れる",
    explanation: "丈夫で安全に閉まり、掃除しやすいキャリーを使います。普段から部屋に置き、毛布やおやつで慣れてもらうと安心です。",
  },
  {
    question: "保護猫を家へ迎えた直後、隠れて出てこない時はどうする？",
    options: ["安全で静かな場所を用意して待つ", "すぐ抱き上げて部屋を案内する", "隠れ場所を全部なくす", "大きな音で呼び続ける"],
    correctAnswer: "安全で静かな場所を用意して待つ",
    explanation: "新しい環境は猫にとって大きな変化です。隠れられる静かな場所を用意し、猫が自分から動くまで無理に触らず待ちます。",
  },
  {
    question: "猫のマイクロチップでできることは何？",
    options: ["読み取り機で身元確認する", "GPSで現在地を追い続ける", "体温を自動調節する", "鳴き声を翻訳する"],
    correctAnswer: "読み取り機で身元確認する",
    explanation: "マイクロチップには固有の識別番号があり、読み取り機と登録情報で飼い主を確認します。GPSのような位置追跡機能はありません。",
  },
  {
    question: "地域で暮らす猫の耳先が少しカットされている時、何の目印であることが多い？",
    options: ["不妊去勢手術を受けた", "けんかが一番強い", "特別な品種である", "毎日薬を飲んでいる"],
    correctAnswer: "不妊去勢手術を受けた",
    explanation: "耳先のカットは、地域猫などが不妊去勢手術を受けたと離れた場所から確認するための目印として使われます。",
  },
  {
    question: "猫が2匹いる家で用意するトイレの目安は、いくつ？",
    options: ["1個", "2個", "3個", "5個"],
    correctAnswer: "3個",
    explanation: "一般的な目安は『猫の数＋1個』。2匹なら3個を、できれば離れた場所へ分けて置きます。",
  },
  {
    question: "猫のトイレを置く場所として向いているのはどこ？",
    options: ["静かで食事場所から離れた所", "洗濯機のすぐ横", "ごはん皿の真横", "人がいつも通る廊下の中央"],
    correctAnswer: "静かで食事場所から離れた所",
    explanation: "猫は落ち着いて使える場所を好みます。大きな音や通行が多い所、ごはん・水・寝床の近くは避けます。",
  },
  {
    question: "成猫へ人用の牛乳をあげる時に注意することは何？",
    options: ["多くの成猫は乳糖を消化しにくい", "牛乳だけで必要な栄養が全部とれる", "温めれば必ず安全になる", "どの猫も水より牛乳を飲むべき"],
    correctAnswer: "多くの成猫は乳糖を消化しにくい",
    explanation: "多くの成猫は乳糖不耐症で、人用の牛乳がお腹をこわす原因になります。飲み水には新鮮な水を用意します。",
  },
  {
    question: "猫のいる家で、ユリの花を特に避ける理由は何？",
    options: ["少量や花粉でも重い腎障害を起こす種類がある", "猫の毛色が変わる", "鳴き声が小さくなる", "爪が伸びなくなる"],
    correctAnswer: "少量や花粉でも重い腎障害を起こす種類がある",
    explanation: "ユリ属やワスレグサ属の植物は、花びら・葉・花粉などの少量でも猫の腎臓へ深刻な害を与えることがあります。家へ持ち込まないのが安全です。",
  },
  {
    question: "猫が玉ねぎを食べると、特に傷つくおそれがあるものは何？",
    options: ["赤血球", "ひげ", "爪", "肉球の模様"],
    correctAnswer: "赤血球",
    explanation: "玉ねぎ類の成分は猫の赤血球を壊し、貧血などを起こすことがあります。加熱した物や料理に入った物にも注意します。",
  },
  {
    question: "猫が人用の解熱鎮痛薬を食べた可能性がある時、どうする？",
    options: ["すぐ獣医師へ相談する", "少しだけなら一日待つ", "牛乳を飲ませる", "別の薬を飲ませる"],
    correctAnswer: "すぐ獣医師へ相談する",
    explanation: "アセトアミノフェンやイブプロフェンなどの人用薬は、猫へ深刻な中毒を起こすことがあります。自己判断で処置せず、すぐ動物病院へ相談します。",
  },
]

const EASY_EXPLANATIONS: Record<string, string> = {
  "甘味の受容体がないから": "受容体（じゅようたい）は、舌で味を受け取る小さなセンサー。猫には甘さ用のセンサーがほとんどありません。",
  "A clowder": "clowder（クラウダー）は、複数の猫の集まりを表す英語です。",
  "体に埋まっている": "鎖骨（さこつ）は胸の上にある骨。猫ではほかの骨に固定されず、筋肉の中にあります。",
  "メインクーン": "房毛（ふさげ）は、耳先などにまとまって生える長い毛。メインクーンの見分けポイントの一つです。",
  "ネペタラクトール": "ネペタラクトールは、マタタビに含まれ、猫のすりすりやごろごろ転がる反応を起こす香りの成分です。",
  "匂いを詳しく分析している時": "フレーメン反応（はんのう）は、口の奥にある特別な器官で匂いを詳しく調べる動きです。",
  "毛の色を決める遺伝子が性染色体上にあるから": "遺伝子（いでんし）は体の特徴を決める設計図。三毛の色と性別の決まりが深く関係しています。",
  "網膜の後ろにあるタペタムが光を反射するから": "網膜（もうまく）は目の奥で光を感じる部分。タペタムという反射板が、少ない光をもう一度使います。",
  "約200度": "視野（しや）は、顔を動かさず見える広さ。猫は人より少し広い範囲を見渡せます。",
  "フェリセット": "フェリセットは、宇宙へ行ったことで知られるフランスの猫です。",
  "Felis catus": "学名（がくめい）は世界共通で使う生き物の名前。Felis catus は『フェリス・カトゥス』と読みます。",
  "猫": "猫は人には聞こえにくい、とても高い音も聞き取れます。獲物の小さな音を見つける助けになります。",
  "まだ研究中で、断定はできない": "ゴロゴロ音の周波数と体への働きを結びつける説はありますが、『鳴けば骨が治る』とまでは確認されていません。",
  "自分の匂いをつけるマーキング行動": "マーキングは、自分の匂いをつけて『ここは安心』と確かめる行動です。",
  "多指症の猫": "多指症（たししょう）は、生まれつき指が一般的な数より多い特徴です。",
  "生きるために動物性タンパク質が不可欠": "不可欠（ふかけつ）は『なくてはならない』という意味。猫には肉や魚に多い栄養が必要です。",
  "チャタリング": "チャタリングは、鳥などを見つけた猫が『カカカッ』と小さく鳴く行動です。",
  "鼻紋（びもん）": "鼻紋（びもん）は、猫の鼻の表面に見える細かな凹凸（おうとつ）の模様です。",
  "ヘンリーのポケット": "耳の外側にある小さな袋状の部分。正式には縁皮嚢（えんぴのう）とも呼ばれます。",
  "鎖骨が体に固定されていないから": "鎖骨（さこつ）がほかの骨に固定されていないため、肩を細くして狭い所を通りやすいのです。",
}

function explanationForQuestion(item: QuizQuestion) {
  return item.explanation ?? EASY_EXPLANATIONS[item.correctAnswer] ?? "正解を覚えたら、猫博士ノートへ新しい一行を追加しよう。"
}

// These IDs are persisted by the parent editor. Keep the existing order stable and append new questions.
export const BUILT_IN_QUIZ_ITEMS: readonly QuizContentOverride[] = ALL_QUIZ_QUESTIONS.map((item, index) => ({
  id: `builtin-cat-${String(index + 1).padStart(3, "0")}`,
  question: item.question,
  options: [...item.options] as QuizContentOverride["options"],
  correctIndex: item.options.indexOf(item.correctAnswer),
  explanation: explanationForQuestion(item),
  hidden: false,
}))

const TIME_PER_QUESTION = 10000 // 10秒 (ミリ秒)
const recordKeyFor = (mode: GlobalDifficulty, questionCount: number) => `${mode}:${questionCount}`

const QUIZ_CORRECT_REACTIONS = [
  "美雪『正解！』トラちゃんから大きな肉球スタンプです。",
  "猫審査員のキキが、しっぽをぴんと立てて合格を知らせています。",
  "ぴったり！ 美雪が博士ノートへ記録し、フワも拍手しています。",
] as const

function quizReaction(question: QuizQuestion, selectedAnswer: string | null, timedOut: boolean, questionIndex: number) {
  if (timedOut) return "時間切れでも答えを読めば一歩前進。解説を確認して次へ進もう。"
  if (selectedAnswer === question.correctAnswer) return QUIZ_CORRECT_REACTIONS[questionIndex % QUIZ_CORRECT_REACTIONS.length]
  if (selectedAnswer?.includes("ゼリー")) return "美雪『猫はゼリーではありません』。解説で正しい特徴を確認しよう。"
  if (selectedAnswer?.includes("電気")) return "三匹『猫に充電口はありません』。正しい答えを見てみよう。"
  if (selectedAnswer?.includes("猫袋")) return "美雪『その名前ではありません』。正しい呼び方を覚えよう。"
  if (selectedAnswer?.includes("猫は小判が好き")) return "ことわざを最初から読み直すと、正しい意味が見えてきます。"
  return `選んだ答えは「${selectedAnswer ?? "ひみつ"}」。解説を読んで、次の一問へ進もう。`
}

function quizResultCopy(correct: number, total: number) {
  const ratio = total ? correct / total : 0
  if (ratio === 1) return "全問正解！ トラちゃん、キキ、フワから猫博士認定です。"
  if (ratio >= 0.8) return "かなりの猫博士！ 間違えた問題だけ復習すれば完璧です。"
  if (ratio >= 0.5) return "半分以上正解！ 美雪の博士ノートで解説を見返そう。"
  return "今日覚えた答えが次の得点。三匹と一緒に復習しよう。"
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

function overrideToQuestion(item: QuizContentOverride): QuizQuestion {
  return {
    question: item.question,
    options: [...item.options] as QuizQuestion["options"],
    correctAnswer: item.options[item.correctIndex],
    explanation: item.explanation || undefined,
  }
}

export function mergeQuizQuestions(overrides: readonly QuizContentOverride[]) {
  const merged = new Map(BUILT_IN_QUIZ_ITEMS.map((item) => [item.id, item]))
  for (const override of overrides) {
    if (override.hidden) {
      merged.delete(override.id)
    } else {
      merged.set(override.id, override)
    }
  }
  return [...merged.values()].map(overrideToQuestion)
}

export function CatQuiz() {
  const { state, recordEvent } = useProgression()
  const [gameState, setGameState] = useState<QuizGameState>("idle")
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)
  const [runQuestionCount, setRunQuestionCount] = useState(10)
  const [runGlobalDifficulty, setRunGlobalDifficulty] = useState<GlobalDifficulty>("standard")
  const [timeProgress, setTimeProgress] = useState(100)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [availableQuestions, setAvailableQuestions] = useState<QuizQuestion[]>(() => mergeQuizQuestions([]))
  const [highScores, setHighScores] = useLocalStorage<Record<string, number>>("catQuizHighScoresV2", {}, isFiniteNumberRecord)
  const [recordSaveFailed, setRecordSaveFailed] = useState(false)

  const animationFrameRef = useRef<number | null>(null)
  const focusFrameRef = useRef<number | null>(null)
  const gameStateRef = useRef<QuizGameState>("idle")
  const answeredRef = useRef(false)
  const advancingRef = useRef(false)
  const completionEventIdRef = useRef<string | null>(null)
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const feedbackButtonRef = useRef<HTMLButtonElement | null>(null)
  const setupHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const returningToSetupRef = useRef(false)
  const globalDifficulty = state.settings.difficulty as GlobalDifficulty
  const activeGlobalDifficulty = gameState === "idle" ? globalDifficulty : runGlobalDifficulty
  const effectiveTimePerQuestion = activeGlobalDifficulty === "gentle" ? null : activeGlobalDifficulty === "challenge" ? 8000 : TIME_PER_QUESTION

  const recordCompletion = useCallback(() => {
    const eventId = completionEventIdRef.current
    if (!eventId) return
    completionEventIdRef.current = null
    recordEvent({
      type: "game.completed",
      eventId,
      occurredAt: new Date().toISOString(),
      gameId: "quiz",
      score: Math.round(score / Math.max(1, sessionQuestions.length)),
      won: sessionQuestions.length > 0 && correctCount >= Math.ceil(sessionQuestions.length / 2),
    })
  }, [correctCount, recordEvent, score, sessionQuestions.length])

  useEffect(() => {
    const refreshQuestions = () => {
      const storage = getContentOverrideStorage()
      const result = storage ? readContentOverrides(storage, "applied") : null
      setAvailableQuestions(mergeQuizQuestions(result?.ok ? result.value.quizItems : []))
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CONTENT_OVERRIDE_APPLIED_KEY || event.key === null) refreshQuestions()
    }

    refreshQuestions()
    window.addEventListener("storage", handleStorage)
    window.addEventListener("miyuki:content-overrides-applied", refreshQuestions)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("miyuki:content-overrides-applied", refreshQuestions)
    }
  }, [])

  const startQuiz = () => {
    if (availableQuestions.length === 0 || (gameStateRef.current !== "idle" && gameStateRef.current !== "finished")) return
    gameStateRef.current = "playing"
    answeredRef.current = false
    advancingRef.current = false
    completionEventIdRef.current = createEventId("game-quiz")
    setRunGlobalDifficulty(globalDifficulty)
    const shuffled = shuffle(availableQuestions)
    const actualQuestionCount = getActualQuizQuestionCount(questionCount, shuffled.length)
    setRunQuestionCount(actualQuestionCount)
    setSessionQuestions(shuffled.slice(0, actualQuestionCount))

    setGameState("playing")
    setCurrentQuestionIndex(0)
    setScore(0)
    setCorrectCount(0)
    setStreak(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setIsTimedOut(false)
    setRecordSaveFailed(false)
    setQuestionStartTime(Date.now())
    setTimeProgress(100)
  }

  const nextQuestion = useCallback(() => {
    if (gameStateRef.current !== "playing" || !answeredRef.current || advancingRef.current) return
    advancingRef.current = true
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      answeredRef.current = false
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setIsTimedOut(false)
      setQuestionStartTime(Date.now())
      setTimeProgress(100)
    } else {
      gameStateRef.current = "finished"
      recordCompletion()
      setGameState("finished")
    }
  }, [currentQuestionIndex, recordCompletion, sessionQuestions.length])

  const handleAnswerClick = useCallback(
    (answer: string | null) => {
      if (gameStateRef.current !== "playing" || answeredRef.current) return
      answeredRef.current = true
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      setIsAnswered(true)

      if (answer === null) {
        setIsTimedOut(true)
        setStreak(0)
      } else {
        setSelectedAnswer(answer)
        if (sessionQuestions.length > 0 && answer === sessionQuestions[currentQuestionIndex].correctAnswer) {
          const points = effectiveTimePerQuestion === null
            ? 1000
            : Math.floor((Math.max(0, effectiveTimePerQuestion - (Date.now() - questionStartTime)) / effectiveTimePerQuestion) * 1000)
          setScore((prev) => prev + points)
          setCorrectCount((value) => value + 1)
          setStreak((value) => value + 1)
        } else {
          setStreak(0)
        }
      }
    },
    [effectiveTimePerQuestion, currentQuestionIndex, questionStartTime, sessionQuestions],
  )

  useEffect(() => {
    if (gameState === "playing" && !isAnswered && effectiveTimePerQuestion !== null) {
      const animate = () => {
        const elapsed = Date.now() - questionStartTime
        const adjustedElapsed = Math.max(0, elapsed - 40)
        const remaining = effectiveTimePerQuestion - adjustedElapsed

        if (remaining <= 0) {
          setTimeProgress(0)
          handleAnswerClick(null)
        } else {
          setTimeProgress((remaining / effectiveTimePerQuestion) * 100)
          animationFrameRef.current = requestAnimationFrame(animate)
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [effectiveTimePerQuestion, gameState, isAnswered, questionStartTime, handleAnswerClick])

  useEffect(() => {
    if (gameState === "playing" && !isAnswered) focusFrameRef.current = window.requestAnimationFrame(() => questionHeadingRef.current?.focus())
    if (gameState === "playing" && isAnswered) focusFrameRef.current = window.requestAnimationFrame(() => feedbackButtonRef.current?.focus())
    if (gameState === "finished") focusFrameRef.current = window.requestAnimationFrame(() => resultHeadingRef.current?.focus())
    if (gameState === "idle" && returningToSetupRef.current) {
      returningToSetupRef.current = false
      focusFrameRef.current = window.requestAnimationFrame(() => setupHeadingRef.current?.focus())
    }
    return () => {
      if (focusFrameRef.current !== null) window.cancelAnimationFrame(focusFrameRef.current)
      focusFrameRef.current = null
    }
  }, [currentQuestionIndex, gameState, isAnswered])

  useEffect(() => {
    if (gameState === "playing") advancingRef.current = false
  }, [currentQuestionIndex, gameState])

  useEffect(() => {
    if (gameState !== "finished") return
    const recordKey = recordKeyFor(runGlobalDifficulty, runQuestionCount)
    if (score > (highScores[recordKey] ?? 0)) setRecordSaveFailed(!setHighScores({ ...highScores, [recordKey]: score }))
    recordCompletion()
  }, [gameState, highScores, recordCompletion, runGlobalDifficulty, runQuestionCount, score, setHighScores])

  const returnToSetup = () => {
    returningToSetupRef.current = true
    gameStateRef.current = "idle"
    answeredRef.current = false
    advancingRef.current = false
    setGameState("idle")
  }

  const renderContent = () => {
    const setupQuestionCount = getActualQuizQuestionCount(questionCount, availableQuestions.length)
    if (gameState === "finished") {
      const stars = correctCount >= sessionQuestions.length * 0.8 ? 3 : correctCount >= sessionQuestions.length * 0.5 ? 2 : 1
      return (
        <div className="game-result-view">
          <Trophy className="game-result-trophy" aria-hidden="true" />
          <p className="game-result-kicker">クイズ終了！</p>
          <h3 ref={resultHeadingRef} tabIndex={-1}>{correctCount} / {sessionQuestions.length}問正解</h3>
          <div className="game-result-stars" aria-label={`${stars}つ星`}>{[1, 2, 3].map((value) => <Star key={value} className={value <= stars ? "is-on" : ""} aria-hidden="true" />)}</div>
          <p>{score}点。正解数だけでなく、解説まで確認した記録です。</p>
          <p>{quizResultCopy(correctCount, sessionQuestions.length)}</p>
          <div className="game-result-record"><Clock3 aria-hidden="true" /><span>{recordSaveFailed ? "保存ずみのベスト" : `${runQuestionCount}問コースのベスト`}</span><strong>{recordSaveFailed ? (highScores[recordKeyFor(runGlobalDifficulty, runQuestionCount)] ?? 0) : Math.max(score, highScores[recordKeyFor(runGlobalDifficulty, runQuestionCount)] ?? 0)}点</strong></div>
          {recordSaveFailed ? <p role="status">今回の新記録は端末に保存できませんでした。</p> : null}
          <GamePrimaryButton onClick={startQuiz} disabled={availableQuestions.length === 0}><RotateCcw aria-hidden="true" />もう一度挑戦</GamePrimaryButton>
          <button type="button" className="game-secondary-button" onClick={returnToSetup}>問題数を変える</button>
        </div>
      )
    }

    if (gameState === "playing") {
      if (sessionQuestions.length === 0) {
        return <div>クイズを準備中...</div>
      }
      const currentQuestion = sessionQuestions[currentQuestionIndex]
      return (
        <div className="quiz-play-view">
          <div className="game-stats-row">
            <GameStat icon={BrainCircuit} label="問題" value={`${currentQuestionIndex + 1}/${sessionQuestions.length}`} />
            <GameStat icon={Sparkles} label="連続正解" value={`${streak}問`} />
            <GameStat icon={Trophy} label="スコア" value={`${score}点`} />
          </div>
          {effectiveTimePerQuestion === null
            ? <p className="quiz-untimed-note"><Clock3 aria-hidden="true" />時間制限なし・根拠を考えて回答</p>
            : <div className="quiz-time-track" aria-label={`残り時間${Math.ceil((timeProgress / 100) * (effectiveTimePerQuestion / 1000))}秒`}><span style={{ width: `${timeProgress}%` }} /></div>}
          <div className="quiz-question-card">
            {isTimedOut && (
              <span className="quiz-timeout"><Timer aria-hidden="true" />時間切れ</span>
            )}
            <small>第{currentQuestionIndex + 1}問</small>
            <h3 ref={questionHeadingRef} tabIndex={-1}>{currentQuestion.question}</h3>
          </div>
          <div className="quiz-options">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.correctAnswer
              const state = isAnswered ? isCorrect ? "correct" : selectedAnswer === option ? "wrong" : "muted" : "ready"

              return (
                <button type="button"
                  key={option}
                  onClick={() => handleAnswerClick(option)}
                  disabled={isAnswered}
                  data-state={state}
                >
                  {option}
                  {isAnswered && isCorrect && <CheckCircle aria-hidden="true" />}
                  {isAnswered && selectedAnswer === option && !isCorrect && <XCircle aria-hidden="true" />}
                </button>
              )
            })}
          </div>
          {isAnswered && (
            <div className={`quiz-feedback ${selectedAnswer === currentQuestion.correctAnswer ? "is-correct" : "is-wrong"}`} aria-live="polite">
              <div>
                <strong>{selectedAnswer === currentQuestion.correctAnswer ? "正解！" : "正解はこちら"}</strong>
                <p>答え：{currentQuestion.correctAnswer}</p>
                {currentQuestion.explanation && <p>{currentQuestion.explanation}</p>}
                <p>{quizReaction(currentQuestion, selectedAnswer, isTimedOut, currentQuestionIndex)}</p>
              </div>
              <button ref={feedbackButtonRef} type="button" onClick={nextQuestion}>{currentQuestionIndex === sessionQuestions.length - 1 ? "結果を見る" : "次の問題"}<ArrowRight aria-hidden="true" /></button>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="game-start-view">
        <div className="game-intro-mark"><BrainCircuit aria-hidden="true" /></div>
        <h3 ref={setupHeadingRef} tabIndex={-1}>猫知識検定</h3>
        <p>{availableQuestions.length > 0 ? `${availableQuestions.length}問から${setupQuestionCount}問をランダム出題。` : "いま遊べる問題はありません。おうちの人の編集室で問題を表示すると遊べます。"}{availableQuestions.length > 0 ? `${effectiveTimePerQuestion === null ? "時間制限なしで" : `1問${effectiveTimePerQuestion / 1000}秒で`}、答えたあとは正解を読んでから自分のペースで次へ進めます。` : ""}</p>
        <div className="game-mode-options" aria-label="問題数を選ぶ">
          {[5, 10].map((count) => <button key={count} type="button" className={questionCount === count ? "is-selected" : ""} onClick={() => setQuestionCount(count as QuestionCount)} aria-pressed={questionCount === count}>
            <strong>{count === 5 ? "5問スプリント" : "10問検定"}</strong><span>{availableQuestions.length > 0 && availableQuestions.length < count ? `現在は${availableQuestions.length}問` : count === 5 ? "短時間で知識確認" : "記録更新に挑戦"}</span>
          </button>)}
        </div>
        {setupQuestionCount > 0 ? <div className="game-record-pill"><Trophy aria-hidden="true" />{setupQuestionCount}問コースのベスト <strong>{highScores[recordKeyFor(globalDifficulty, setupQuestionCount)] ?? 0}点</strong></div> : null}
        <GamePrimaryButton onClick={startQuiz} disabled={availableQuestions.length === 0}><Play aria-hidden="true" />クイズ開始</GamePrimaryButton>
      </div>
    )
  }

  return <GameShell title="にゃんこクイズ" subtitle="猫の生態を4択で検証。回答後は根拠となる解説も確認できます。" icon={BrainCircuit} tone="mint">{renderContent()}</GameShell>
}
