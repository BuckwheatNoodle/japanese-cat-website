export type DiaryGlossaryItem = {
  term: string
  reading: string
  meaning: string
}

export const DIARY_PUNCHLINE_TYPES = [
  "reversal",
  "three-beat",
  "wordplay",
  "callback",
  "mistaken-identity",
  "silent-reaction",
  "self-own",
  "escalation",
  "role-swap",
  "surprise-reveal",
] as const

export type DiaryPunchlineType = (typeof DIARY_PUNCHLINE_TYPES)[number]

export const DIARY_CAT_IDS = ["cat-maron", "cat-yuki", "cat-mike", "cat-kuro", "cat-tora"] as const
export type DiaryCatId = (typeof DIARY_CAT_IDS)[number]

export const DIARY_COLLECTION_IDS = [
  "naokun-poop-classic",
  "naokun-poop-soda",
  "naokun-poop-gold",
  "naokun-poop-rainbow",
  "naokun-poop-chef",
  "naokun-poop-bakery",
  "naokun-poop-ninja",
  "naokun-poop-detective",
  "naokun-poop-pirate",
  "naokun-poop-space",
  "naokun-poop-samurai",
  "naokun-poop-snowman",
  "naokun-poop-sakura",
  "naokun-poop-pumpkin",
  "naokun-poop-mermaid",
  "naokun-poop-princess",
  "naokun-poop-robot",
  "naokun-poop-music",
  "naokun-poop-artist",
  "naokun-poop-cactus",
  "naokun-poop-cake",
  "naokun-poop-hero",
  "naokun-poop-ghost",
  "naokun-poop-cat",
] as const

export type DiaryCollectionId = (typeof DIARY_COLLECTION_IDS)[number]

export type DiaryEntry = {
  date: string
  title: string
  body: string
  miyukiNote: string
  illustration: string
  imagePath: string
  alt: string
  collectionId: DiaryCollectionId
  catIds: readonly DiaryCatId[]
  punchlineType: DiaryPunchlineType
  glossary: readonly DiaryGlossaryItem[]
}

type DiarySeed = Omit<DiaryEntry, "illustration" | "imagePath">

function word(term: string, reading: string, meaning: string): DiaryGlossaryItem {
  return { term, reading, meaning }
}

function diary(seed: DiarySeed): DiaryEntry {
  const imagePath = "/content/diary/" + seed.date + ".webp"
  return { ...seed, illustration: imagePath, imagePath }
}

export const DIARY_SAFE_TRANSFORMATION_CUES = [
  "きらきら光る魔法",
  "ぽんっと弾けるマスコット魔法",
  "星がきらめく変身魔法",
  "ミント色の光の魔法",
  "拍手で始まる変身ごっこ",
  "虹色リボンのマスコット魔法",
  "ふわっと光る遊びの魔法",
  "鈴が鳴る星空魔法",
  "笑顔で始まるごっこ遊びの魔法",
  "ぴかっと光るマスコット魔法",
  "花びらが舞う変身魔法",
] as const

export const DIARY_ENTRIES: DiaryEntry[] = [
  diary({
    date: "2026-08-12",
    title: "段ボール海のうんち船長",
    body: "わたしが段ボール船を作ると、マロンが船長席を先取りしました。なおくんは、きらきら光る魔法で海賊うんち船長に変身し、甲板で「出航！」と大はりきり。ところがクロが「船はテープで床にとまっています」と静かに札を出し、船は一ミリも進みません。なおくんのあいさつだけが、先に世界一周しました。",
    miyukiNote: "船長、次の航海の前にテープをはがす係を決めましょう。",
    alt: "段ボール船の甲板で肉球旗を振る海賊うんち船長のなおくんと、船長席のマロン、札を見せるクロ、笑う美雪",
    collectionId: "naokun-poop-pirate",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "wordplay",
    glossary: [word("甲板", "かんぱん", "船の上にある、外へ出られるゆか")],
  }),
  diary({
    date: "2026-08-11",
    title: "おうち山のうんち救助隊",
    body: "わたしがクッション山を作ると、トラまるは三秒で登頂し、ユキはふもとでのんびり見上げました。なおくんは、ぽんっと弾けるマスコット魔法で救助隊うんちに変身し、「山頂のみんな、今行くよ！」と出発。けれど途中で動けなくなり、トラまるが上からリボンをするすると下ろしました。助けに行ったなおくんが、いちばん先に救助されました。",
    miyukiNote: "救助隊の第一号は、救助隊長本人です。",
    alt: "クッション山の途中でリボンにつかまる救助隊うんちのなおくんと、山頂のトラまる、ふもとのユキと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-yuki"],
    punchlineType: "role-swap",
    glossary: [word("登頂", "とうちょう", "山のいちばん上まで登ること")],
  }),
  diary({
    date: "2026-08-10",
    title: "スリッパホテルのうんち係",
    body: "わたしがスリッパホテルを開くと、ミケは赤い部屋、ユキは水玉の部屋を選び、すぐ満室になりました。なおくんは、星がきらめく変身魔法でベル係うんちに変身し、「お部屋までご案内します」と得意顔。ところが部屋の札を全部、お気に入りの青い肉球マークに書きかえてしまいました。どれも同じ札で部屋が分からなくなり、最後はなおくんだけが肉球部屋を探し続け、猫たちはもう夢の中です。",
    miyukiNote: "ベル係さん、自分が泊まる部屋はありません。",
    alt: "色とりどりのスリッパで眠るミケとユキ、同じ青い肉球札を何枚も持つベル係うんちのなおくんと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-mike", "cat-yuki"],
    punchlineType: "reversal",
    glossary: [word("満室", "まんしつ", "ホテルの部屋が全部使われていて、空きがないこと")],
  }),
  diary({
    date: "2026-08-09",
    title: "宿題を見守るうんち消しゴム",
    body: "わたしが算数を始めると、クロがノートの横で先生みたいな顔をしました。なおくんは、ミント色の光の魔法で巨大うんち消しゴムに変身し、「まちがいは全部ぼくにまかせて！」と登場。でも大きすぎて一文字も消せず、クロに「見守り係」と書かれた小さな札を立てられました。なおくんは消しゴムより、札のモデルとして百点の笑顔です。",
    miyukiNote: "答えは消えませんでしたが、やる気のない言いわけは消えました。",
    alt: "算数ノートの横で見守り係の札を立てられた巨大うんち消しゴムのなおくんと、先生役のクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-kuro"],
    punchlineType: "self-own",
    glossary: [word("巨大", "きょだい", "ふつうより、とても大きいこと")],
  }),
  diary({
    date: "2026-08-08",
    title: "せんぷうきとうんち雲",
    body: "わたしがせんぷうきをつけると、トラまるの毛はライオン、クロのしっぽはブラシみたいにふくらみました。なおくんは、拍手で始まる変身ごっこでふわふわうんち雲に変身し、「ぼくが風の王さま！」とくるくる。弱風では一回転、中風では二回転、強風の前に自分から三回転しました。せんぷうきはまだ弱風のままでした。",
    miyukiNote: "本日の風速は、なおくんのやる気だけ最大です。",
    alt: "弱風のせんぷうきの前で三回転する雲うんちのなおくんと、毛がふくらんだトラまるとクロ、美雪",
    collectionId: "naokun-poop-ghost",
    catIds: ["cat-tora", "cat-kuro"],
    punchlineType: "three-beat",
    glossary: [word("風速", "ふうそく", "風がどれくらい速く動くかを表すもの")],
  }),
  diary({
    date: "2026-08-07",
    title: "すいか模様の夏うんち",
    body: "わたしが猫たちへ、すいか柄の紙ぼうしを作りました。なおくんは、虹色リボンのマスコット魔法でしましま夏うんちに変身し、「ぼくは全身で夏です」と花道へ。審査員のクロは無言で鏡を向け、マロンは「すいかというより、しましまの大きなこま」と札を出しました。なおくんは鏡の前で回り始め、ファッションショーはこま大会になりました。",
    miyukiNote: "夏の方向はまちがえましたが、回転はきれいでした。",
    alt: "すいか模様の夏うんち姿で回るなおくんと、鏡を向けるクロ、採点札を持つマロン、紙ぼうしの猫たちと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-kuro", "cat-maron"],
    punchlineType: "silent-reaction",
    glossary: [word("審査員", "しんさいん", "できばえを見て、よいところを決める人")],
  }),
  diary({
    date: "2026-08-06",
    title: "しゃぼん玉うんち社長",
    body: "わたしがしゃぼん玉を飛ばすと、ミケの鼻に一つだけ止まり、白いおひげみたいになりました。なおくんは遊び用の部屋へ移動してから、ふわっと光る遊びの魔法で泡だらけのうんち社長に変身。議題を「猫のお昼寝を二倍にする」にすると、マロン、ユキ、クロが同時に肉球札を上げました。会議は三秒で終わり、社長だけが一時間あいさつしました。",
    miyukiNote: "会社でいちばん長いのは、なおくんのあいさつです。",
    alt: "しゃぼん玉の遊び部屋で長いあいさつをするうんち社長のなおくんと、肉球札を上げるマロン、ユキ、クロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-yuki", "cat-kuro"],
    punchlineType: "escalation",
    glossary: [word("議題", "ぎだい", "会議でみんなが話し合うテーマ")],
  }),
  diary({
    date: "2026-08-05",
    title: "パズル最後のうんちピース",
    body: "わたしが大きなパズルを広げると、ユキは完成図の上で丸くなりました。なおくんは、鈴が鳴る星空魔法で特大うんちピースに変身し、「最後の一枚はぼくです！」と登場。穴より三倍大きいのに、右を向き、左を向き、最後は横向きで入ろうとしました。クロが定規で測る前から、結果は見えていました。",
    miyukiNote: "入らない理由は向きではなく、大きさです。",
    alt: "大きなパズル穴の前で向きを三回変える特大うんちピースのなおくんと、完成図で休むユキ、定規を持つクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-yuki", "cat-kuro"],
    punchlineType: "three-beat",
    glossary: [word("完成図", "かんせいず", "できあがった形を見せる絵や図")],
  }),
  diary({
    date: "2026-08-04",
    title: "かくれんぼのうんちおとり",
    body: "わたしとミケがかくれんぼを始めると、なおくんは、笑顔で始まるごっこ遊びの魔法でうんちのおとりに変身し、部屋の真ん中へ座りました。「ここにはだれもいません」と自分で札を持っています。カーテンの後ろのクロは笑い声をこらえていますが、なおくんは一秒で見つかって「最速記録！」と大喜び。かくれる大会なのに、見つかる速さで優勝しました。",
    miyukiNote: "おとりより、札を読んでいる本人がいちばん目立ちます。",
    alt: "部屋の真ん中でだれもいませんの札を持つおとりうんちのなおくんと、カーテンから見るクロとミケ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-mike", "cat-kuro"],
    punchlineType: "self-own",
    glossary: [word("おとり", "おとり", "相手の目を、本当とはちがう方へ向ける役")],
  }),
  diary({
    date: "2026-08-03",
    title: "テレビのうんちリモコン台",
    body: "トラまるがリモコンの横でしっぽを振るたび、テレビの音量が一つずつ上がりました。わたしが困っていると、なおくんは、ぴかっと光るマスコット魔法でリモコン台うんちに変身。「音量はぼくが守る！」と言った直後、自分の声でテレビより大きく「しずかにー！」。クロはテレビを消し、部屋でいちばん大きな音だけが残りました。",
    miyukiNote: "音量を下げる前に、なおくんの声を下げてください。",
    alt: "リモコンをのせた台うんちの姿で大声を出すなおくんと、テレビを消すクロ、しっぽを振るトラまる、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-kuro"],
    punchlineType: "reversal",
    glossary: [word("音量", "おんりょう", "音の大きさ")],
  }),
  diary({
    date: "2026-08-02",
    title: "紙ひも仙人とうんち弟子",
    body: "わたしの工作部屋で、トラまるの鼻に白い紙ひもがのり、立派な仙人ひげになりました。なおくんは工作マットへ移動し、花びらが舞う変身魔法でうんち弟子に変身。仙人へ「強くなる方法」を聞くと、トラまるは目を閉じて、紙ひもを一本だけなおくんへ渡しました。なおくんはそれを頭にのせ、「ひげが生えたから合格！」と自分で卒業しました。",
    miyukiNote: "修行時間は十二秒。卒業を決めたのも本人です。",
    alt: "工作マットで紙ひもを頭にのせるうんち弟子のなおくんと、仙人ひげのトラまる、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora"],
    punchlineType: "mistaken-identity",
    glossary: [word("仙人", "せんにん", "山などで修行し、不思議な力を持つとされる人")],
  }),
  diary({
    date: "2026-08-01",
    title: "空き缶のうんち門番",
    body: "わたしがきれいに洗って乾かした空き缶を、マロンとミケが秘密基地にしました。なおくんは缶から離れた遊びマットで、きらきら光る魔法でうんち門番に変身し、「一匹ずつどうぞ！」と案内。けれど立っていたのは押し入れの前で、猫の秘密基地は部屋の反対側です。なおくんは一日中、だれも来ない押し入れをりっぱに守りました。",
    miyukiNote: "門番さん、まず門の場所を確認してください。",
    alt: "遊びマットで押し入れを守るうんち門番のなおくんと、反対側の空き缶基地から見るマロンとミケ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-mike"],
    punchlineType: "surprise-reveal",
    glossary: [word("秘密基地", "ひみつきち", "自分たちだけが知っている、特別な遊び場所")],
  }),
  diary({
    date: "2026-07-31",
    title: "うんち市長選挙",
    body: "わたしが箱の町を作ると、マロンは昼寝党、トラまるは運動党を作りました。なおくんは、ぽんっと弾けるマスコット魔法でうんち市長に変身し、「昼寝も運動も一日二十時間！」と公約を発表。クロが「一日は二十四時間です」と黒板に書くと、なおくんは一日からはみ出した十六時間をどこへ入れるか計算し始めました。投票より先に、市長の算数教室が始まりました。",
    miyukiNote: "市長さん、時間を増やす公約は守れません。",
    alt: "箱の町で一日四十時間の公約を発表するうんち市長のなおくんと、黒板を見せるクロ、マロンとトラまる、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-tora", "cat-kuro"],
    punchlineType: "wordplay",
    glossary: [word("公約", "こうやく", "選挙で、当選したらするとみんなに約束すること")],
  }),
  diary({
    date: "2026-07-30",
    title: "猫サーカスのうんち安全マット",
    body: "わたしが床の紙テープで一本橋を作ると、ユキはゆっくり、トラまるは元気よく渡り切りました。なおくんは、星がきらめく変身魔法で安全マットうんちに変身し、「もしもの時はぼくへ！」と待機。でも全員が成功したので、自分で「安全のお手本」を始め、となりの本物のクッションへふわり。安全マットが安全マットを使いました。",
    miyukiNote: "だれより安全を必要としていたのは、なおくんでした。",
    alt: "紙テープの一本橋の横で本物のクッションへ着地する安全マットうんちのなおくんと、ユキ、トラまる、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-yuki", "cat-tora"],
    punchlineType: "role-swap",
    glossary: [word("待機", "たいき", "出番が来るまで、その場所で待つこと")],
  }),
  diary({
    date: "2026-07-29",
    title: "動くうんち博物館",
    body: "わたしが猫の写真を並べて博物館を開くと、クロは受付、マロンは案内係になりました。なおくんは、ミント色の光の魔法でうんちの像に変身し、「特別展示です」とぴたり。ミケが赤いリボンを見せると目だけが右、左、右へ動き、最後は体ごとついて行きました。静かな像より、動きすぎる像として人気が出ました。",
    miyukiNote: "展示品が出口までお客さんを追いかけています。",
    alt: "猫写真の博物館で赤いリボンを目で追って歩き出すうんち像のなおくんと、受付のクロ、案内係のマロン、ミケと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-kuro", "cat-maron", "cat-mike"],
    punchlineType: "escalation",
    glossary: [word("展示", "てんじ", "みんなに見てもらうため、品物や作品を並べること")],
  }),
  diary({
    date: "2026-07-28",
    title: "うんちファッション大賞",
    body: "わたしが猫たちへリボンをつけると、ミケは赤、ユキは白、クロは緑を選びました。なおくんは、拍手で始まる変身ごっこできらきらマントのうんちモデルに変身。鏡に映った自分を次の出場者だと思い、「どうぞお先に」と三回道をゆずりました。クロ審査員は「いちばん礼儀正しい鏡で賞」を出しました。",
    miyukiNote: "四人目の出場者は、ずっと鏡の中です。",
    alt: "鏡の自分へ道をゆずるマント姿のうんちモデルなおくんと、リボン姿のミケ、ユキ、クロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-mike", "cat-yuki", "cat-kuro"],
    punchlineType: "mistaken-identity",
    glossary: [word("礼儀", "れいぎ", "相手を大切にする、ていねいなふるまい")],
  }),
  diary({
    date: "2026-07-27",
    title: "おばけ屋敷のうんちおばけ",
    body: "わたしが毛布でおばけ屋敷を作ると、マロンは案内係、クロはびっくりしない係になりました。なおくんは、虹色リボンのマスコット魔法で白い布をかぶったうんちおばけに変身し、そろりそろり。曲がり角の鏡に自分が映ると、「出たー！」と一番大きな声を出しました。お客より先に、おばけ本人がびっくりしています。",
    miyukiNote: "本日いちばんこわかったものは、自分の笑顔だそうです。",
    alt: "毛布のおばけ屋敷で鏡の自分に驚くうんちおばけのなおくんと、案内係のマロン、平気なクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "self-own",
    glossary: [word("案内係", "あんないがかり", "道や順番を、わかりやすく教える役")],
  }),
  diary({
    date: "2026-07-26",
    title: "猫電車とうんち駅長",
    body: "わたしが段ボール箱をつないで猫電車を作ると、マロンは運転手、ミケとユキはお客になりました。なおくんは、ふわっと光る遊びの魔法でうんち駅長に変身し、出発の旗を上げます。ところが楽しそうな車内を見て、自分も最後尾へ乗り込みました。電車は満員、ホームには駅長の帽子だけが残りました。",
    miyukiNote: "駅長が最初のお客さんになっています。",
    alt: "猫電車の最後尾に乗り込むうんち駅長のなおくんと、運転手のマロン、お客のミケとユキ、ホームの帽子と美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-mike", "cat-yuki"],
    punchlineType: "reversal",
    glossary: [word("最後尾", "さいこうび", "列や乗り物の、いちばん後ろ")],
  }),
  diary({
    date: "2026-07-25",
    title: "正義のうんちマン",
    body: "ユキの青いボールが棚の下へ入り、わたしが定規を探していました。なおくんは、鈴が鳴る星空魔法で正義のうんちマンに変身し、「救出！」とマントを広げます。けれどユキが長いしっぽでボールをころんと出し、事件は先に解決。なおくんはすぐ表彰式へ切りかえ、ユキへ金紙のメダルを渡しました。",
    miyukiNote: "ヒーローの今日の仕事は、メダル係でした。",
    alt: "棚の下からボールを出したユキへ金紙のメダルを渡す正義のうんちマンなおくんと、美雪",
    collectionId: "naokun-poop-hero",
    catIds: ["cat-yuki"],
    punchlineType: "role-swap",
    glossary: [word("救出", "きゅうしゅつ", "困っている人や物を、安全な場所へ助け出すこと")],
  }),
  diary({
    date: "2026-07-24",
    title: "ねこ図書館のうんち看板",
    body: "わたしがねこ図書館を開くと、マロンは店長、クロは静かにする係になりました。なおくんは、笑顔で始まるごっこ遊びの魔法でにこにこうんち看板に変身し、入口で「こちらです」。でも看板を反対向きに置いたので、矢印はずっと押し入れを指しています。押し入れの前だけ、入館待ちのぬいぐるみでいっぱいになりました。",
    miyukiNote: "本は一冊もありませんが、押し入れは大人気です。",
    alt: "ねこ図書館で押し入れを指す反対向きのうんち看板なおくんと、店長のマロン、静かにする係のクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "callback",
    glossary: [word("入館", "にゅうかん", "図書館や博物館などの建物に入ること")],
  }),
  diary({
    date: "2026-07-23",
    title: "うんちカーリング選手権",
    body: "わたしが紙のリンクを作ると、トラまるはしっぽで応援、クロは得点係になりました。なおくんは、ぴかっと光るマスコット魔法でうんちストーンに変身し、「選手より石がいい！」。一回目は近すぎ、二回目は遠すぎ、三回目はスタートの合図だけで自分からすべりました。クロの得点札は全部「楽しさ十点」です。",
    miyukiNote: "場所の点はゼロでも、楽しさだけ満点でした。",
    alt: "紙のカーリングリンクを自分からすべるうんちストーンのなおくんと、応援するトラまる、得点札を持つクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-kuro"],
    punchlineType: "three-beat",
    glossary: [word("選手権", "せんしゅけん", "だれが一番かを決める大会")],
  }),
  diary({
    date: "2026-07-22",
    title: "うんち指揮者の猫バンド",
    body: "わたしのタンバリン、トラまるのしっぽ鈴、ミケの「にゃー」で猫バンドを作りました。なおくんは、花びらが舞う変身魔法でうんち指揮者に変身し、指揮棒を右、左、くるん。みんなの音がばらばらなので楽譜を上下逆にすると、なぜかぴったりそろいました。正しい向きへ戻したら、またばらばらです。",
    miyukiNote: "曲名は「さかさま大成功」に決まりました。",
    alt: "上下逆の楽譜で猫バンドをまとめるうんち指揮者なおくんと、鈴のトラまる、歌うミケ、タンバリンの美雪",
    collectionId: "naokun-poop-music",
    catIds: ["cat-tora", "cat-mike"],
    punchlineType: "surprise-reveal",
    glossary: [word("指揮者", "しきしゃ", "みんなの演奏がそろうよう、合図を出す人")],
  }),
  diary({
    date: "2026-07-21",
    title: "磁石池のうんち島",
    body: "わたしが紙の魚と磁石で釣り池を作ると、ミケは赤い魚、ユキは青い魚をねらいました。なおくんは、きらきら光る魔法でうんち島に変身し、池の真ん中で応援係。トラまるの磁石が島の小さな旗をつり上げると、なおくんは「大物です！」と大よろこび。つれたのは島ではなく、旗だけです。",
    miyukiNote: "大物の気分だけは、ちゃんと釣れました。",
    alt: "磁石の釣り池で旗だけをつり上げられ大物のポーズをするうんち島なおくんと、ミケ、ユキ、トラまる、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-mike", "cat-yuki", "cat-tora"],
    punchlineType: "wordplay",
    glossary: [word("磁石", "じしゃく", "鉄などを引きつける力を持つもの")],
  }),
  diary({
    date: "2026-07-20",
    title: "うんちクッションは丸見え",
    body: "わたしとクロがカーテンの後ろへかくれると、なおくんは、ぽんっと弾けるマスコット魔法でうんちクッションに変身し、「うまくまぎれるよ」とソファへ座りました。形も色もぴったりなのに、うれしくて「まだかな、まだかな」とずっと小声。マロンは声のするクッションへ「見つけました」の札を置きました。なおくんは見つかった瞬間、いちばん大きく笑いました。",
    miyukiNote: "見た目はかくれても、わくわくはかくせません。",
    alt: "ソファでまだかなと話すうんちクッションなおくんと、見つけましたの札を置くマロン、カーテンの美雪とクロ",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-kuro", "cat-maron"],
    punchlineType: "callback",
    glossary: [word("まぎれる", "まぎれる", "ほかの物にまざって、見つけにくくなること")],
  }),
  diary({
    date: "2026-07-19",
    title: "金色うんちの学校劇",
    body: "わたしが学校劇の台本を書き、ミケはお姫さま、クロは王さまになりました。なおくんは、星がきらめく変身魔法で金色うんち役に変身し、自分で「光る置物」という役を追加。せりふはゼロなのに、一幕で一回、二幕で二回、最後は三回おじぎしました。カーテンコールだけで、出番を全部使い切りました。",
    miyukiNote: "台本より、おじぎの回数表が必要です。",
    alt: "学校劇の舞台で三回目のおじぎをする金色うんち役のなおくんと、お姫さまのミケ、王さまのクロ、美雪",
    collectionId: "naokun-poop-gold",
    catIds: ["cat-mike", "cat-kuro"],
    punchlineType: "escalation",
    glossary: [word("一幕", "ひとまく", "劇をいくつかに分けたうちの、一つのまとまり")],
  }),
  diary({
    date: "2026-07-18",
    title: "宇宙うんち流星号",
    body: "わたしが段ボールロケットを作ると、マロン船長とクロ通信係が乗り込みました。なおくんは、ミント色の光の魔法で宇宙うんち流星に変身し、出発前からロケットの周りを一周、二周、三周。目を回さないよう猫ベッドへふわりと着地すると、「ただいま、月から帰りました！」。まだロケットは出発していません。",
    miyukiNote: "宇宙旅行のいちばん遠い場所は、となりの猫ベッドでした。",
    alt: "出発前の段ボールロケットの横で猫ベッドへ着地する宇宙うんち流星なおくんと、マロン船長、クロ通信係、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "surprise-reveal",
    glossary: [word("通信係", "つうしんがかり", "遠くの相手へ知らせを送ったり受けたりする役")],
  }),
  diary({
    date: "2026-07-17",
    title: "天気予報はうんち雲",
    body: "わたしがテレビごっこで天気予報を始めると、ユキは窓辺、ミケはお天気図の前へ座りました。なおくんは、拍手で始まる変身ごっこで茶色いうんち雲に変身し、「午後から色紙の星が降るでしょう」。わたしが上から星を一枚だけ落とすと、なおくんは十枚分の大きなかさを開きました。予報より、かさのほうが大げさです。",
    miyukiNote: "降水量は星一枚、かさの広さは部屋いっぱい。",
    alt: "色紙の星一枚に部屋いっぱいの大きなかさを開くうんち雲なおくんと、ユキ、天気図のミケ、美雪",
    collectionId: "naokun-poop-ghost",
    catIds: ["cat-yuki", "cat-mike"],
    punchlineType: "reversal",
    glossary: [word("降水量", "こうすいりょう", "雨や雪などが、どれくらい降ったかを表す量")],
  }),
  diary({
    date: "2026-07-16",
    title: "猫探偵とうんちの手がかり",
    body: "トラまるの鈴つきリボンが見つからず、わたしとクロ探偵が捜査を始めました。なおくんは、虹色リボンのマスコット魔法でうんち型の手がかりに変身し、廊下で「発見してください」と待機。一つ目の手がかりも、二つ目も、三つ目も全部なおくんです。最後に振り向くと、本物のリボンはなおくんのマントについていました。",
    miyukiNote: "手がかり本人が、事件の答えを背負っています。",
    alt: "背中のマントに鈴つきリボンをつけたまま手がかり役をするうんちなおくんと、探偵のクロ、トラまる、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-kuro"],
    punchlineType: "callback",
    glossary: [word("捜査", "そうさ", "何が起きたか、手がかりを集めて調べること")],
  }),
  diary({
    date: "2026-07-15",
    title: "うんちレフ板で撮影会",
    body: "わたしが猫の撮影会を開くと、クロがカメラ係、ミケが最初のモデルになりました。なおくんは、ふわっと光る遊びの魔法で光を集めるうんち型レフ板に変身。でも光より先に笑顔を向け、右から一枚、左から一枚、後ろからも顔だけ登場。写真の題名は全部「猫と、どうしても写りたい兄」です。",
    miyukiNote: "レフ板は光を入れる道具で、顔を入れる道具ではありません。",
    alt: "猫の撮影画面へ三方向から顔を出すうんち型レフ板なおくんと、カメラ係のクロ、モデルのミケ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-kuro", "cat-mike"],
    punchlineType: "three-beat",
    glossary: [word("レフ板", "レフばん", "光を反射させて、写真を明るくする板")],
  }),
  diary({
    date: "2026-07-14",
    title: "魔法でうんちに大成功",
    body: "わたしが紙のステッキを持つと、マロンとユキがお客さんの席へ並びました。「鈴が鳴る星空魔法で、うんちになあれ」と言う前に、なおくんはもう王道うんちへ変身。わたしがステッキを上げるたび、先にポーズ、先に拍手、先にアンコールまでしました。魔法より、なおくんの予定表が三歩先です。",
    miyukiNote: "まだ始まっていないのに、再公演が決まりました。",
    alt: "紙のステッキより先に変身しアンコールの札まで持つ王道うんちなおくんと、客席のマロン、ユキ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-yuki"],
    punchlineType: "escalation",
    glossary: [word("再公演", "さいこうえん", "同じ劇やショーを、もう一度行うこと")],
  }),
  diary({
    date: "2026-07-13",
    title: "猫ボウリングのうんちピン",
    body: "わたしがペットボトルのピンを並べると、トラまるは毛糸玉、クロは得点表を用意しました。なおくんは、笑顔で始まるごっこ遊びの魔法でうんちピンに変身し、一番前へ。毛糸玉は大きく右へそれたのに、なおくんは合図だけでクッションへころんと倒れ、「ストライク！」。クロの得点表には「自主的に一回転」と書かれました。",
    miyukiNote: "当たっていないので、正しくはストライクごっこです。",
    alt: "それた毛糸玉を横目にクッションへ自分から倒れるうんちピンなおくんと、トラまる、得点表のクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-kuro"],
    punchlineType: "self-own",
    glossary: [word("自主的", "じしゅてき", "だれかに言われる前に、自分からするようす")],
  }),
  diary({
    date: "2026-07-12",
    title: "段ボール城のうんち門番",
    body: "わたしと猫たちが段ボール城を作り、マロンが王さま、ミケが大臣になりました。なおくんは、ぴかっと光るマスコット魔法でうんち門番に変身し、「通行証をどうぞ」と入口へ。マロンが肉球スタンプを帽子へ押すと、なおくんは王さまの印だと思って玉座へ向かいました。門番は三秒で王さま候補になり、入口はわたしが守りました。",
    miyukiNote: "スタンプ一個で出世しすぎです。",
    alt: "肉球スタンプの帽子で玉座へ向かううんち門番なおくんと、王さまのマロン、大臣のミケ、入口を守る美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-mike"],
    punchlineType: "mistaken-identity",
    glossary: [word("通行証", "つうこうしょう", "その場所を通ってよいと示すしるしや紙")],
  }),
  diary({
    date: "2026-07-11",
    title: "消えた鈴とうんち裁判長",
    body: "わたしが消えた鈴を調べる猫裁判を開くと、マロンが証人、クロが記録係になりました。なおくんは、きらきら光る魔法でうんち裁判長に変身し、「証拠品を見せてください」と大まじめ。クロが裁判長の大きなかつらを指すと、その中からチリン。犯人は見つからず、証拠品だけが裁判長をかぶっていました。",
    miyukiNote: "判決より先に、かつらを外せば終わる裁判でした。",
    alt: "大きな裁判長のかつらの中で鈴が鳴り、指さすクロと証人席のマロンに見られるうんち裁判長なおくんと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "surprise-reveal",
    glossary: [word("証拠品", "しょうこひん", "出来事の本当のようすを確かめる手がかりになる物")],
  }),
  diary({
    date: "2026-07-10",
    title: "八秒後のうんち未来人",
    body: "わたしとトラまるが段ボール箱に時計とレバーをつけ、ミケが見届け役になってタイムマシンを作りました。なおくんは、ぽんっと弾けるマスコット魔法でうんち未来人に変身し、「八秒後の未来へ行ってきます」。箱へ入り、同じ扉から八秒後に出ると、「未来のぼくは少し大人でした」と得意顔。トラまるのストップウォッチも、たしかに八秒だけ未来でした。",
    miyukiNote: "所要時間は八秒、移動距離はゼロセンチです。",
    alt: "段ボールのタイムマシンから得意顔で出るうんち未来人なおくんと、ストップウォッチを持つトラまる、見届けるミケ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-mike"],
    punchlineType: "self-own",
    glossary: [word("所要時間", "しょようじかん", "あることをするのにかかった時間")],
  }),
  diary({
    date: "2026-07-09",
    title: "スタートが遅いうんち実況席",
    body: "わたしがテープで競走路を作ると、マロンとミケがスタート線へ、クロがゴール旗へ並びました。なおくんは、星がきらめく変身魔法でうんち実況者に変身し、長い前置きを始めました。「さあ、いよいよ、まもなく、もうすぐ……」と言っている間に二匹はゴール。クロが旗を振ったあと、なおくんは元気よく「スタートです！」と叫びました。",
    miyukiNote: "実況だけ、次のレースに出場していました。",
    alt: "すでにゴールしたマロンとミケ、旗を振るクロの横で今からスタートを告げるうんち実況者なおくんと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-mike", "cat-kuro"],
    punchlineType: "reversal",
    glossary: [word("実況", "じっきょう", "その場で起きていることを見ながら、すぐに伝えること")],
  }),
  diary({
    date: "2026-07-08",
    title: "透明カーテンのうんち忍者",
    body: "わたしが忍者屋敷ごっこを始めると、ユキは見張り役、クロは判定役になりました。なおくんは、ミント色の光の魔法でうんち忍者に変身し、「完全に消えます」と透明なカーテンの後ろへ。カーテン越しに三段の形も笑顔も丸見えなのに、本人だけが息をひそめています。クロは見つけた札でなく、見えている札を静かに上げました。",
    miyukiNote: "見つかっていないのは、なおくん本人だけです。",
    alt: "透明なカーテンの後ろで隠れたつもりのうんち忍者なおくんと、見えている絵札を上げるクロ、見張るユキ、美雪",
    collectionId: "naokun-poop-ninja",
    catIds: ["cat-yuki", "cat-kuro"],
    punchlineType: "silent-reaction",
    glossary: [word("透明", "とうめい", "向こう側がすけて見えること")],
  }),
  diary({
    date: "2026-07-07",
    title: "願いが一種類のうんち星係",
    body: "わたしが七夕の飾りを広げると、ユキとトラまるは願いごとの絵札を選びました。なおくんは、花びらが舞う変身魔法でうんち星係に変身し、はしご、星のマント、紙の流れ星まで準備万端。ところが二匹の絵札は、どちらも月とクッションの絵でした。猫たちが先に眠り、星係の大仕事は電気を消す一回で終わりました。",
    miyukiNote: "用意した流れ星より、眠気のほうが仕事が速いです。",
    alt: "星のマントや紙の流れ星を山ほど用意したまま、月とクッションの絵札を持って眠るユキとトラまるを見るうんち星係なおくんと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-yuki", "cat-tora"],
    punchlineType: "role-swap",
    glossary: [word("準備万端", "じゅんびばんたん", "必要な用意がすっかり整っていること")],
  }),
  diary({
    date: "2026-07-06",
    title: "消えた一冊とうんち図書委員",
    body: "わたしが猫図書館の本を数えると、ユキが棚の前で一冊ずつ前足を上げました。なおくんは、ふわっと光る遊びの魔法でうんち図書委員に変身し、「蔵書が一冊足りません」と大捜索。クロがなおくんの座っているクッションをめくると、下から探していた本が出ました。図書委員は本を見つけたまま、その本の上で捜していました。",
    miyukiNote: "いちばん近い本ほど、立ち上がらないと見えません。",
    alt: "自分のクッションの下から本を見つけられ、驚くうんち図書委員なおくんと、本を示すクロ、棚で数えるユキ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-yuki", "cat-kuro"],
    punchlineType: "surprise-reveal",
    glossary: [word("蔵書", "ぞうしょ", "図書館などが持っている本")],
  }),
  diary({
    date: "2026-07-05",
    title: "静かすぎないうんち音声ガイド",
    body: "わたしとマロンが猫のおもちゃ博物館を作り、ミケが最初のお客さんになりました。なおくんは、鈴が鳴る星空魔法でうんち音声ガイドに変身し、メガホンで「こちらは静けさを楽しむ展示です！」。紙の展示が風でふるえ、猫たちの耳がそろって横を向きました。なおくんは小声にならず、「静けさまで説明できました」と満足そうでした。",
    miyukiNote: "説明が終わった瞬間だけ、本物の静けさでした。",
    alt: "静けさの展示へメガホンで大声の案内をするうんち音声ガイドなおくんと、耳を横へ向けるマロンとミケ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-mike"],
    punchlineType: "wordplay",
    glossary: [word("音声ガイド", "おんせいガイド", "展示などの説明を声で聞ける案内")],
  }),
  diary({
    date: "2026-07-04",
    title: "休けいだけ完璧なうんちコーチ",
    body: "わたしがクッションと毛糸で運動コースを作ると、トラまるとミケがすぐ走り始めました。なおくんは、笑顔で始まるごっこ遊びの魔法でうんちコーチに変身し、「まず正しい休けいの見本です」とクッションへ。猫たちが二周しても、三周しても、見本は同じ姿勢のまま。最後に起き上がり、自分へ休けい名人のメダルをかけました。",
    miyukiNote: "指導した周回はゼロ、休けいの実演は三回です。",
    alt: "運動コースを何周も走るトラまるとミケの横で、クッションの休けい姿勢を実演し自分へメダルをかけるうんちコーチなおくんと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-mike"],
    punchlineType: "self-own",
    glossary: [word("実演", "じつえん", "やり方を実際にやって見せること")],
  }),
  diary({
    date: "2026-07-03",
    title: "三分の一だけ消えたうんち魔術師",
    body: "わたしが紙のトランプを並べると、マロンとクロが魔術ショーの客席へ座りました。なおくんは、ぴかっと光るマスコット魔法でうんち魔術師に変身し、大きな帽子を自分へかぶせて「消えました！」。帽子に隠れたのは一番上だけで、下の二段は堂々と客席の前です。クロが拍手を一回すると、なおくんは完全成功だと思って二回おじぎしました。",
    miyukiNote: "消失したのは、なおくんの上から三分の一です。",
    alt: "大きな帽子で一番上だけ隠し、下二段が丸見えのうんち魔術師なおくんと、客席で一回だけ拍手するクロ、マロン、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "three-beat",
    glossary: [word("消失", "しょうしつ", "見えていたものが消えてなくなること")],
  }),
  diary({
    date: "2026-07-02",
    title: "五周するうんちロボ司令官",
    body: "わたしがぜんまいねずみへ紙の掃除ブラシをつけると、ミケが出発旗を持ちました。なおくんは、拍手で始まる変身ごっこでうんちロボ司令官に変身し、床へ矢印のテープを貼りました。矢印が丸くつながっていたので、ねずみロボはなおくんの周りを五周。司令官は、二十センチ先のゴールを見ながら「完璧な見回りです」と敬礼しました。",
    miyukiNote: "同じ場所を五回守り、ゴールは一度も訪れませんでした。",
    alt: "丸くつながった矢印に沿って五周するぜんまいねずみロボへ敬礼するうんちロボ司令官なおくんと、旗を持つミケ、美雪",
    collectionId: "naokun-poop-robot",
    catIds: ["cat-mike"],
    punchlineType: "callback",
    glossary: [word("司令官", "しれいかん", "仲間へすることや進む方向を伝える役")],
  }),
  diary({
    date: "2026-07-01",
    title: "リボン前のうんち開会式",
    body: "わたしとユキが七月の遊び場を開くため、長い紙リボンを用意し、ミケとクロも見届けに来ました。なおくんは、虹色リボンのマスコット魔法でうんち式典係に変身し、「ただいま開会します」と紙のはさみを一振り。けれどユキはまだリボンの巻きを持ったままで、入口には何も張られていません。なおくんは何も切らず、遊び場だけ三秒早く開きました。",
    miyukiNote: "テープカットは、テープの到着を待ちましょう。",
    alt: "まだ巻かれた紙リボンを持つユキの前で、何もない入口を紙のはさみで切るうんち式典係なおくんと、見届けるミケ、クロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-yuki", "cat-mike", "cat-kuro"],
    punchlineType: "reversal",
    glossary: [word("テープカット", "テープカット", "新しい場所などの始まりに、入口のリボンを切る行事")],
  }),
  diary({
    date: "2026-06-30",
    title: "全部つけたうんち表彰係",
    body: "わたしが半年の猫表彰会を開き、マロンへ昼寝名人、ユキへ高い所名人のメダルを作りました。なおくんは、きらきら光る魔法でうんち表彰係に変身し、「なくさないよう預かります」と全メダルを自分の首へ。重くなったクッション表彰台がゆっくり沈み、猫たちは首に何もないまま見守りました。受賞者は二匹、公式に全部つけた人は一人です。",
    miyukiNote: "表彰係が、いちばん表彰された見た目になりました。",
    alt: "猫用のメダルを全部首へかけて沈むクッション表彰台に立つうんち表彰係なおくんと、何もつけず見守るマロン、ユキ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-yuki"],
    punchlineType: "role-swap",
    glossary: [word("受賞者", "じゅしょうしゃ", "賞をもらう人や動物")],
  }),
  diary({
    date: "2026-06-29",
    title: "全部ほめ言葉のうんち猫語通訳",
    body: "わたしが猫語会見を開くと、マロンは毛糸玉、クロは窓の絵札を持って話し始めました。なおくんは、ミント色の光の魔法でうんち猫語通訳に変身し、どの「にゃー」も「なおくんがすばらしいです」と翻訳。クロが通訳辞典を開くと、全部のページになおくんの似顔絵しかありません。猫語より、なおくん語のほうが一冊ぶん多い辞典でした。",
    miyukiNote: "翻訳ではなく、毎ページ同じ自己紹介です。",
    alt: "全ページが自分の似顔絵の通訳辞典を持つうんち猫語通訳なおくんと、毛糸玉と窓の絵札を示すマロンとクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "surprise-reveal",
    glossary: [word("翻訳", "ほんやく", "ある言葉を、別の言葉へ直して伝えること")],
  }),
  diary({
    date: "2026-06-28",
    title: "長すぎるうんち振り向き係",
    body: "わたしが『だるまさんがころんだ』の線を引くと、トラまるとミケが後ろへ並びました。なおくんは、ふわっと光る遊びの魔法でうんち振り向き係に変身し、目を閉じて長い長い合図を始めました。言い終わる前に二匹はゆっくりゴールし、クッションでくつろいでいます。やっと振り向いたなおくんは、だれも動いていないので審判成功だと喜びました。",
    miyukiNote: "動いていないのは、もう全員ゴールしたからです。",
    alt: "長い合図のあと振り向き、すでにゴールのクッションでくつろぐトラまるとミケを見て成功を喜ぶうんち振り向き係なおくんと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-mike"],
    punchlineType: "reversal",
    glossary: [word("審判", "しんぱん", "遊びや試合の決まりを守っているか判断する役")],
  }),
  diary({
    date: "2026-06-27",
    title: "頭が滑走路のうんち管制官",
    body: "わたしが紙飛行機大会を開くと、ミケが飛ばす係、クロが着地点を確かめる係になりました。なおくんは、鈴が鳴る星空魔法でうんち管制官に変身し、床の滑走路へ旗を振りました。飛行機は大きく曲がって、なおくんの頭へ帽子のように着陸。管制官は床を見たまま「一番滑走路、到着です」と言い、クロが頭上を指しました。",
    miyukiNote: "緊急着陸した場所が、今日から二番滑走路です。",
    alt: "紙飛行機が頭へ帽子のように着陸したことに気づかず床へ旗を振るうんち管制官なおくんと、頭上を指すクロ、飛ばしたミケ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-mike", "cat-kuro"],
    punchlineType: "mistaken-identity",
    glossary: [word("緊急着陸", "きんきゅうちゃくりく", "予定とちがう場所へ、急いで安全に降りること")],
  }),
  diary({
    date: "2026-06-26",
    title: "影絵も本人のうんち劇団",
    body: "わたしが懐中電灯で影絵舞台を作ると、ユキとクロが形当てのお客さんになりました。なおくんは、笑顔で始まるごっこ遊びの魔法でうんち影絵役者に変身し、壁の三段シルエットを「伝説の竜です」と紹介。クロが本人の形と影を見くらべ、同じ形の絵札を二枚上げました。役者となぞなぞの答えが、最初から同じ舞台に立っています。",
    miyukiNote: "影の正体は、ひねりなしのなおくんでした。",
    alt: "壁の三段シルエットを竜として紹介するうんち影絵役者なおくんと、本人と影の同じ形の絵札を上げるクロ、ユキ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-yuki", "cat-kuro"],
    punchlineType: "callback",
    glossary: [word("シルエット", "シルエット", "光を当てたときに見える、黒い輪郭の形")],
  }),
  diary({
    date: "2026-06-25",
    title: "一階しかないうんちエレベーター",
    body: "わたしが段ボールでエレベーターを作ると、マロンが入口の植木役、クロが階数確認係になりました。なおくんは、拍手で始まる変身ごっこでうんち案内係に変身し、カーテンを閉めて「二階です、三階です、屋上です」と次々案内。毎回カーテンを開けても、同じマロンと同じ植木がいます。移動はゼロセンチ、案内だけ三階ぶん進みました。",
    miyukiNote: "このエレベーターは、声だけ高い所へ行きます。",
    alt: "一階の同じマロンと植木が見える段ボールエレベーターで、三階ぶん案内するうんち係なおくんと、確認するクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "three-beat",
    glossary: [word("階数", "かいすう", "建物の何階なのかを表す数")],
  }),
  diary({
    date: "2026-06-24",
    title: "全部同じ顔のうんちスタンプ係",
    body: "わたしが部屋の四か所にスタンプ台を置くと、ユキとミケがカードを持って回り始めました。なおくんは、ぴかっと光るマスコット魔法でうんちスタンプ係に変身し、一つの自分顔スタンプを向きだけ変えて四回ぺたん。できたカードは、横向き、逆さ、少し傾いたなおくん顔でいっぱいです。なおくんは参加者名簿を見て、「ファンクラブが二人増えました」と数えました。",
    miyukiNote: "集めたのは記念スタンプではなく、なおくんの角度です。",
    alt: "向きだけ違う自分の顔スタンプでカードをいっぱいにするうんちスタンプ係なおくんと、カードを見くらべるユキ、ミケ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-yuki", "cat-mike"],
    punchlineType: "wordplay",
    glossary: [word("参加者名簿", "さんかしゃめいぼ", "参加する人や動物の名前をまとめた一覧")],
  }),
  diary({
    date: "2026-06-23",
    title: "進めと止まれのうんち交通係",
    body: "わたしが積み木の町と紙の道路を作ると、マロンとトラまるが車役になりました。なおくんは、虹色リボンのマスコット魔法でうんち交通係に変身し、右手に進め、左手に止まれの丸い札。二枚を同時に上げたので、猫たちは一歩目のまま固まりました。なおくんだけが横断し、「今日も事故なしです」と胸を張りました。",
    miyukiNote: "交通整理ではなく、交通全部止めでした。",
    alt: "進めと止まれの絵札を同時に上げて道路を渡るうんち交通係なおくんと、動けず固まる車役のマロン、トラまる、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-tora"],
    punchlineType: "self-own",
    glossary: [word("交通整理", "こうつうせいり", "道を通る人や車が安全に進めるよう合図すること")],
  }),
  diary({
    date: "2026-06-22",
    title: "帽子をかぶったうんち落とし物係",
    body: "わたしが落とし物受付を作ると、ミケは鉛筆、クロは青いリボンを届けました。なおくんは、星がきらめく変身魔法でうんち落とし物係に変身し、「船長帽子を探しています」と台帳をめくります。クロが鏡を前へ置くと、探している帽子は最初からなおくんの頭の上。なおくんは帽子を自分へ返し、受取人と係の両方へおじぎしました。",
    miyukiNote: "落とし物ではなく、かぶり物でした。",
    alt: "頭の船長帽子を探して台帳をめくるうんち落とし物係なおくんと、鏡を置くクロ、鉛筆を届けるミケ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-mike", "cat-kuro"],
    punchlineType: "mistaken-identity",
    glossary: [word("台帳", "だいちょう", "品物や出来事を順番に書いて残す帳面")],
  }),
  diary({
    date: "2025-08-31",
    title: "宿題うんちタイマー",
    body: "わたしが夏休みの宿題表を広げると、クロが終わった所へ丸をつけてくれました。なおくんは、花びらが舞う変身魔法でうんちタイマーに変身し、「十分集中、二分休けい！」と時間係。みんなへ合図を出し終えた後、自分の読書記録だけ真っ白だと気づきました。タイマーはその日初めて、自分のために十分をはかりました。",
    miyukiNote: "見守り係にも、見守られる宿題がありました。",
    alt: "夏休みの宿題表の前で自分の読書記録を見つめるうんちタイマーなおくんと、丸をつけるクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-kuro"],
    punchlineType: "reversal",
    glossary: [word("読書記録", "どくしょきろく", "読んだ本の題名や感想を書いて残すもの")],
  }),
  diary({
    date: "2025-08-30",
    title: "巨大うんちの小さな正体",
    body: "朝、壁いっぱいになおくんの影が映り、わたしとミケは「巨大なおくんだ！」とびっくり。本人は、きらきら光る魔法で巨大うんちに変身したと言って大きなポーズを取りました。クロがカーテンを開けると、体はいつもの大きさで、足元の懐中電灯が影をのばしていただけ。巨大だったのは、なおくんの自信でした。",
    miyukiNote: "影は三メートル、自信はたぶん十メートルです。",
    alt: "懐中電灯で壁へ大きな影を映す魔法うんち姿のなおくんと、正体に気づくクロ、驚くミケと美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-mike", "cat-kuro"],
    punchlineType: "surprise-reveal",
    glossary: [word("懐中電灯", "かいちゅうでんとう", "持ち運べる、小さな電気の明かり")],
  }),
  diary({
    date: "2025-08-29",
    title: "ぐるぐる模様のうんちダンサー",
    body: "わたしが音楽をかけると、トラまるはしっぽ、ミケは前足でリズムを取りました。なおくんは、ぽんっと弾けるマスコット魔法でぐるぐる模様のうんちダンサーに変身。一回目は右、二回目は左、三回目はどちらか分からず、その場でぴたり。クロが「停止もダンスです」と札を出すと、なおくんは止まったまま得意顔になりました。",
    miyukiNote: "今日いちばん長い技は、動かないことでした。",
    alt: "ぐるぐる模様のうんちダンサー姿で得意顔のまま止まるなおくんと、踊るトラまる、ミケ、札を持つクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-mike", "cat-kuro"],
    punchlineType: "three-beat",
    glossary: [word("停止", "ていし", "動いていたものが止まること")],
  }),
  diary({
    date: "2025-08-17",
    title: "箱入りうんちとマロン",
    body: "小さな箱へマロンがすっぽり入ったので、わたしが「箱入り店長」と呼びました。なおくんは、星がきらめく変身魔法で小さなうんち姿に変身して箱へ入ろうとしましたが、箱はもう満席。そこで空の箱を帽子にして「箱かぶり店長です」と登場しました。マロンは箱の中、なおくんは箱の下です。",
    miyukiNote: "同じ箱でも、入り方がずいぶんちがいます。",
    alt: "箱を帽子のようにかぶる魔法うんち姿のなおくんと、別の箱へすっぽり入るマロン、笑う美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron"],
    punchlineType: "wordplay",
    glossary: [word("満席", "まんせき", "座る場所が全部使われ、空いていないこと")],
  }),
  diary({
    date: "2025-08-16",
    title: "五匹会議とうんち議長",
    body: "わたしが猫会議を開くと、マロン、ユキ、ミケ、クロ、トラまるが丸く座りました。なおくんは、ミント色の光の魔法でうんち議長に変身し、「今日の議題は遊びの順番です」。マロンが昼寝、ユキも昼寝、残り三匹も昼寝の札を上げました。会議は始まる前に全員一致でお昼寝になりました。",
    miyukiNote: "議長だけが、閉会のあいさつを聞いてもらえません。",
    alt: "丸く座って昼寝の札を上げる五匹の猫と、開会直後に閉会するうんち議長なおくん、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-yuki", "cat-mike", "cat-kuro", "cat-tora"],
    punchlineType: "silent-reaction",
    glossary: [word("全員一致", "ぜんいんいっち", "みんなの意見が同じになること")],
  }),
  diary({
    date: "2025-08-15",
    title: "鳥見うんち望遠鏡",
    body: "クロが窓から小鳥を見ていたので、わたしも観察ノートを持ってきました。なおくんは、拍手で始まる変身ごっこでうんち望遠鏡に変身し、「遠くまで見えます！」。でものぞく向きを反対にしたので、近くのクロが豆つぶみたいに小さく見えました。なおくんは「すごく遠い猫を発見！」と記録しました。",
    miyukiNote: "発見した猫は、ずっと目の前にいます。",
    alt: "窓辺で望遠鏡の向きを反対にしてクロを観察するうんち望遠鏡なおくんと、小鳥を見る美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-kuro"],
    punchlineType: "mistaken-identity",
    glossary: [word("観察", "かんさつ", "ようすをよく見て、気づいたことを調べること")],
  }),
  diary({
    date: "2025-08-14",
    title: "ひなたぼっこのうんち目覚まし",
    body: "ユキが窓辺のひなたで気持ちよさそうに眠り、わたしまで眠くなりました。なおくんは、虹色リボンのマスコット魔法でうんち目覚ましに変身し、「三時になったら起こします」。二時五十九分に一回あくび、二回目で目を閉じ、三時には本人が一番ぐっすり。ユキが先に起きて、時計をのぞきました。",
    miyukiNote: "目覚ましを起こす係が必要です。",
    alt: "三時の時計の前で眠るうんち目覚ましなおくんと、先に起きて時計を見るユキ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-yuki"],
    punchlineType: "role-swap",
    glossary: [word("ひなた", "ひなた", "日光が当たって、明るく暖かい場所")],
  }),
  diary({
    date: "2025-08-13",
    title: "毛糸迷路のうんち案内板",
    body: "トラまるが赤い毛糸を部屋中へ運び、わたしは毛糸迷路を作りました。なおくんは、ふわっと光る遊びの魔法でうんち案内板に変身し、「出口はこちら」。ところが矢印を右、左、上の三方向へつけたので、ミケはその場でくるり。最後になおくんも自分の矢印を見て、入口へ戻ってきました。",
    miyukiNote: "案内板が迷ったので、今日は全員スタートへ戻ります。",
    alt: "三方向の矢印を持って毛糸迷路の入口へ戻るうんち案内板なおくんと、くるりと回るミケ、トラまる、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-tora", "cat-mike"],
    punchlineType: "callback",
    glossary: [word("迷路", "めいろ", "道が分かれていて、出口を探して進む遊び")],
  }),
  diary({
    date: "2025-08-12",
    title: "うんち宇宙ラジオ",
    body: "わたしが紙コップで宇宙ラジオを作ると、マロンは通信係、ミケは星の地図係になりました。なおくんは、鈴が鳴る星空魔法でアンテナつき宇宙うんちに変身し、「月から返事が来ました！」。よく聞くと「にゃー、にゃー」という声で、送信していたのは隣の箱にいるトラまるです。月との通信は、部屋の端から端まで成功しました。",
    miyukiNote: "宇宙より近いですが、返事は世界一かわいかったです。",
    alt: "紙コップの宇宙ラジオで隣の箱のトラまると通信するアンテナつきうんちなおくんと、マロン、ミケ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-mike", "cat-tora"],
    punchlineType: "surprise-reveal",
    glossary: [word("送信", "そうしん", "声や知らせを、相手へ送ること")],
  }),
  diary({
    date: "2025-08-11",
    title: "肉球タッチのうんち応援団",
    body: "わたしが紙の花を作ると、ミケが前足を上げて応援の練習を始めました。なおくんは、笑顔で始まるごっこ遊びの魔法でうんち応援団に変身し、肉球タッチのボタンを用意。ミケがそっとタッチすると紙吹雪が一枚、二回目で二枚、三回目はなおくんの「わーい！」だけが飛び出しました。紙吹雪より声のほうが多い応援です。",
    miyukiNote: "ボタンの中には、なおくんの元気が入っていました。",
    alt: "肉球タッチのボタンへそっと前足をのせるミケと、紙吹雪を出すうんち応援団なおくん、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-mike"],
    punchlineType: "three-beat",
    glossary: [word("応援団", "おうえんだん", "声や動きで、がんばる人を元気づけるチーム")],
  }),
  diary({
    date: "2025-08-10",
    title: "朝いちばんのうんちニュース",
    body: "朝、マロンが新聞の上へ座ったので、わたしはテレビニュースごっこを始めました。なおくんは、ぴかっと光るマスコット魔法でうんちニュースキャスターに変身し、「速報です。なおくんがうんちになりました！」。クロが「画面を見れば分かります」と札を出すと、なおくんはもう一度同じ速報を読みました。二回目も、やっぱり全員知っています。",
    miyukiNote: "新しいニュースは、まだ届いていません。",
    alt: "速報の札を持って同じニュースを二回読むうんちニュースキャスターなおくんと、新聞に座るマロン、札を出すクロ、美雪",
    collectionId: "naokun-poop-classic",
    catIds: ["cat-maron", "cat-kuro"],
    punchlineType: "wordplay",
    glossary: [word("速報", "そくほう", "起きたばかりのことを、すぐに知らせるニュース")],
  }),
]

// 日記の役と図鑑カードが同じ場合だけ専用フォームを解放します。
// 専用カードがない小道具・係の回は、別の衣装を誤解放しないよう王道フォームにまとめます。
export const DIARY_COLLECTION_BY_DATE: Readonly<Record<string, DiaryCollectionId>> = {
  "2026-08-12": "naokun-poop-pirate",
  "2026-08-11": "naokun-poop-classic",
  "2026-08-10": "naokun-poop-classic",
  "2026-08-09": "naokun-poop-classic",
  "2026-08-08": "naokun-poop-ghost",
  "2026-08-07": "naokun-poop-classic",
  "2026-08-06": "naokun-poop-classic",
  "2026-08-05": "naokun-poop-classic",
  "2026-08-04": "naokun-poop-classic",
  "2026-08-03": "naokun-poop-classic",
  "2026-08-02": "naokun-poop-classic",
  "2026-08-01": "naokun-poop-classic",
  "2026-07-31": "naokun-poop-classic",
  "2026-07-30": "naokun-poop-classic",
  "2026-07-29": "naokun-poop-classic",
  "2026-07-28": "naokun-poop-classic",
  "2026-07-27": "naokun-poop-classic",
  "2026-07-26": "naokun-poop-classic",
  "2026-07-25": "naokun-poop-hero",
  "2026-07-24": "naokun-poop-classic",
  "2026-07-23": "naokun-poop-classic",
  "2026-07-22": "naokun-poop-music",
  "2026-07-21": "naokun-poop-classic",
  "2026-07-20": "naokun-poop-classic",
  "2026-07-19": "naokun-poop-gold",
  "2026-07-18": "naokun-poop-classic",
  "2026-07-17": "naokun-poop-ghost",
  "2026-07-16": "naokun-poop-classic",
  "2026-07-15": "naokun-poop-classic",
  "2026-07-14": "naokun-poop-classic",
  "2026-07-13": "naokun-poop-classic",
  "2026-07-12": "naokun-poop-classic",
  "2026-07-11": "naokun-poop-classic",
  "2026-07-10": "naokun-poop-classic",
  "2026-07-09": "naokun-poop-classic",
  "2026-07-08": "naokun-poop-ninja",
  "2026-07-07": "naokun-poop-classic",
  "2026-07-06": "naokun-poop-classic",
  "2026-07-05": "naokun-poop-classic",
  "2026-07-04": "naokun-poop-classic",
  "2026-07-03": "naokun-poop-classic",
  "2026-07-02": "naokun-poop-robot",
  "2026-07-01": "naokun-poop-classic",
  "2026-06-30": "naokun-poop-classic",
  "2026-06-29": "naokun-poop-classic",
  "2026-06-28": "naokun-poop-classic",
  "2026-06-27": "naokun-poop-classic",
  "2026-06-26": "naokun-poop-classic",
  "2026-06-25": "naokun-poop-classic",
  "2026-06-24": "naokun-poop-classic",
  "2026-06-23": "naokun-poop-classic",
  "2026-06-22": "naokun-poop-classic",
  "2025-08-31": "naokun-poop-classic",
  "2025-08-30": "naokun-poop-classic",
  "2025-08-29": "naokun-poop-classic",
  "2025-08-17": "naokun-poop-classic",
  "2025-08-16": "naokun-poop-classic",
  "2025-08-15": "naokun-poop-classic",
  "2025-08-14": "naokun-poop-classic",
  "2025-08-13": "naokun-poop-classic",
  "2025-08-12": "naokun-poop-classic",
  "2025-08-11": "naokun-poop-classic",
  "2025-08-10": "naokun-poop-classic",
}

export function validateDiaryEntries(entries: readonly DiaryEntry[]) {
  const issues: string[] = []
  if (entries.length !== 63) issues.push("日記は63件必要です。")
  if (Object.keys(DIARY_COLLECTION_BY_DATE).length !== 63) issues.push("日記の図鑑対応表は63件必要です。")

  const dates = new Set<string>()
  const imagePaths = new Set<string>()
  const alts = new Set<string>()
  const punchlineTypes = new Set<DiaryPunchlineType>()

  for (const entry of entries) {
    if (dates.has(entry.date)) issues.push(entry.date + " の日付が重複しています。")
    dates.add(entry.date)

    const expectedImagePath = "/content/diary/" + entry.date + ".webp"
    if (entry.imagePath !== expectedImagePath) issues.push(entry.date + " の画像パスが日付と一致しません。")
    if (entry.illustration !== entry.imagePath) issues.push(entry.date + " の画像参照が一致しません。")
    if (imagePaths.has(entry.imagePath)) issues.push(entry.date + " の画像パスが重複しています。")
    imagePaths.add(entry.imagePath)

    if (!entry.alt.trim()) issues.push(entry.date + " の画像説明が空です。")
    if (alts.has(entry.alt)) issues.push(entry.date + " の画像説明が重複しています。")
    alts.add(entry.alt)

    if (!entry.body.includes("わたし")) issues.push(entry.date + " の本文が美雪の一人称になっていません。")
    if (!entry.body.includes("なおくん")) issues.push(entry.date + " の本文になおくんがいません。")
    const transformationSentence = entry.body
      .split("。")
      .find((sentence) => sentence.includes("変身") && /うんち[^。]{0,40}(?:に|へ)変身/.test(sentence))
    if (!transformationSentence) {
      issues.push(entry.date + " になおくんのうんち姿への変身が明記されていません。")
    } else if (!DIARY_SAFE_TRANSFORMATION_CUES.some((cue) => transformationSentence.includes(cue))) {
      issues.push(entry.date + " の変身文に安全な魔法の説明がありません。")
    }
    if (/[叩踏殴蹴舐]|猫パンチ|なめ/.test(entry.body + entry.miyukiNote)) {
      issues.push(entry.date + " に強い接触表現があります。")
    }

    if (!DIARY_COLLECTION_IDS.includes(entry.collectionId)) issues.push(entry.date + " の図鑑IDが不正です。")
    const expectedCollectionId = DIARY_COLLECTION_BY_DATE[entry.date]
    if (!expectedCollectionId) {
      issues.push(entry.date + " の図鑑対応が監査されていません。")
    } else if (entry.collectionId !== expectedCollectionId) {
      issues.push(entry.date + " の図鑑IDが変身役と一致しません。")
    }
    if (entry.catIds.length === 0 || entry.catIds.some((catId) => !DIARY_CAT_IDS.includes(catId))) {
      issues.push(entry.date + " の猫IDが不正です。")
    }

    if (entry.glossary.length === 0) issues.push(entry.date + " のことばのヒントがありません。")
    for (const item of entry.glossary) {
      if (!item.term.trim() || !item.reading.trim() || !item.meaning.trim()) {
        issues.push(entry.date + " のことばのヒントに空欄があります。")
      }
      if (!(entry.title + entry.body + entry.miyukiNote).includes(item.term)) {
        issues.push(entry.date + " のことば「" + item.term + "」が本文にありません。")
      }
    }

    punchlineTypes.add(entry.punchlineType)
  }

  for (const mappedDate of Object.keys(DIARY_COLLECTION_BY_DATE)) {
    if (!dates.has(mappedDate)) issues.push(mappedDate + " の図鑑対応に日記がありません。")
  }

  if (punchlineTypes.size < 8) issues.push("オチの構造は8種類以上必要です。")
  return issues
}

export const DIARY_ENTRY_VALIDATION_ISSUES = validateDiaryEntries(DIARY_ENTRIES)
if (DIARY_ENTRY_VALIDATION_ISSUES.length > 0) {
  throw new Error("絵日記データの検証に失敗しました。\n" + DIARY_ENTRY_VALIDATION_ISSUES.join("\n"))
}

export const AVAILABLE_DIARY_MONTHS = [...new Set(DIARY_ENTRIES.map((entry) => entry.date.slice(0, 7)))].sort(
  (a, b) => b.localeCompare(a),
)
