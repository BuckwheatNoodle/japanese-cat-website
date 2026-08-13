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

export const DIARY_CATS = [
  { id: "cat-maron", name: "トラちゃん", appearance: "茶トラ", personality: "元気な挑戦役" },
  { id: "cat-kuro", name: "キキ", appearance: "黒猫", personality: "冷静な観察役" },
  { id: "cat-yuki", name: "フワ", appearance: "白い長毛", personality: "のんびり屋" },
] as const

export type DiaryCatId = (typeof DIARY_CATS)[number]["id"]
export const DIARY_CAT_IDS = DIARY_CATS.map((cat) => cat.id) as [DiaryCatId, ...DiaryCatId[]]

export const DIARY_CAT_BY_ID = Object.fromEntries(
  DIARY_CATS.map((cat) => [cat.id, cat]),
) as Readonly<Record<DiaryCatId, (typeof DIARY_CATS)[number]>>

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
  collectionId?: DiaryCollectionId
  catIds: readonly DiaryCatId[]
  punchlineType: DiaryPunchlineType
  glossary: readonly DiaryGlossaryItem[]
}

type DiaryDraft = Pick<DiaryEntry, "date" | "title" | "body" | "alt" | "catIds"> & {
  collectionId?: DiaryCollectionId
}

const ALL_CATS: readonly DiaryCatId[] = ["cat-maron", "cat-kuro", "cat-yuki"]

function diary(draft: DiaryDraft): DiaryEntry {
  const imagePath = `/content/diary/${draft.date}.webp`
  const punchlineIndex = Number(draft.date.replaceAll("-", "")) % DIARY_PUNCHLINE_TYPES.length
  return {
    ...draft,
    miyukiNote: "",
    illustration: imagePath,
    imagePath,
    punchlineType: DIARY_PUNCHLINE_TYPES[punchlineIndex],
    glossary: [],
  }
}

export const MIYUKI_REFERENCE_ENTRIES: Readonly<Record<string, string>> = {
  "2026-06-22": "なおくんはうんちだから雨で流されると心配してました。そんなことより早く猫と昼寝したいです。",
  "2026-06-23": "なおくんはうんち妖精としてネットで話題になりました。そんなことより猫と散歩したいです。",
  "2026-06-24": "なおくんはうんちを越えて下痢になりました。そんなことより猫とじゃれ合いたいです。",
  "2026-06-25": "なおくんはうんちに呪われてるとお祓いに行きました。そんなことより猫のみんなとトランプしたいです。",
  "2026-06-26": "なおくんはうんちに呪われてないと安心してました。そんなことより猫にご飯をあげないとです。",
  "2026-06-27": "なおくんの前世はうんちらしいです。今世もうんちなのに。そんなことより猫の研究をしたいです。",
  "2026-06-28": "なおくんはオシッコがライバルと言い張ってます。そんなことより猫のトイレ掃除をしないとです。",
  "2026-06-29": "なおくんはうんちが出るのでしょうか。なおくんはうんちだから出ないのでしょうか。トラちゃんは研究中です。",
  "2026-06-30": "なおくんは作った工作にうんちがついたと泣いてました。そんなことより猫のブラッシングをしたいです。",
  "2026-07-01": "なおくんは暑すぎてとけそうです。そんなことより猫と涼みたいです。",
  "2026-07-02": "なおくんはソファに溶けたうんちをつけてお母さんに怒られました。そんなことより猫とゴロゴロしたいです。",
  "2026-07-03": "トラちゃんがなおくんに飛び蹴りをしました。そんなことより猫とお絵描きしたいです。",
  "2026-07-04": "なおくんは1日中ダラダラしてました。私も猫とダラダラしたいです。",
}

export const DIARY_ENTRIES: readonly DiaryEntry[] = [
  diary({
    date: "2026-09-01",
    title: "うらが一面",
    body: "なおくんは新聞の一面を白紙のまま発行しました。記事は全部うらにありました。そんなことよりトラちゃんの写真だけ見たいです。",
    alt: "新聞のうらを読むトラちゃんと、白紙のそばにいる顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-08-31",
    title: "一円のお店",
    body: "なおくんはお店の商品を全部一円にしました。売り切れたのにもうけも一円でした。そんなことより猫のお店でお買い物したいです。",
    alt: "小さなお店屋さんをするトラちゃん、キキ、フワと、一円札のそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-30",
    title: "たき火係",
    body: "なおくんは自分を炭だと言い張ってキャンプへ来ました。お母さんに見つかってたき火は中止です。猫と毛布にくるまるので問題ないです。",
    alt: "毛布でくつろぐトラちゃん、キキ、フワと、消えたたき火のそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-29",
    title: "うんち交通整理",
    body: "なおくんは道の真ん中で交通整理を始めました。動かないので猫たちは全員よけて通りました。私も猫のあとについていきます。",
    alt: "床の迷路を進むトラちゃん、キキ、フワと、中央にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-28",
    title: "古代のなおくん",
    body: "なおくんは自分が古代のうんちだと発表しました。昨日も同じ場所にいたのでたぶん違います。トラちゃんと本物の宝物を掘りたいです。",
    alt: "砂場で宝物を掘るトラちゃんと、発掘現場にいる顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-08-27",
    title: "主役はフワ",
    body: "なおくんは人形劇の主役になると張り切ってました。幕が開く前からフワが寝ていて、みんなそっちを見てました。やっぱり主役は猫です。",
    alt: "小さな人形劇の舞台ですやすや眠るフワと、舞台袖にいる顔のないうんち姿のなおくん",
    catIds: ["cat-yuki"],
  }),
  diary({
    date: "2026-08-26",
    title: "風の実験",
    body: "なおくんは扇風機の前で飛行実験をしました。飛んだのは紙だけで、なおくんは床を少し転がりました。そんなことより猫と風にあたりたいです。",
    alt: "扇風機の風を楽しむキキとフワ、床を少し転がる顔のないうんち姿のなおくん",
    catIds: ["cat-kuro", "cat-yuki"],
  }),
  diary({
    date: "2026-08-25",
    title: "トイレ行きの手紙",
    body: "なおくんは自分あての手紙をポストに入れました。住所はトイレの奥と書いてありました。そんなことよりキキと郵便屋さんごっこしたいです。",
    alt: "おもちゃの郵便かばんを持つキキと、トイレ行きの封筒のそばにいる顔のないうんち姿のなおくん",
    catIds: ["cat-kuro"],
  }),
  diary({
    date: "2026-08-24",
    title: "九センチの記録",
    body: "なおくんは毎日身長を測ってます。何回測っても九センチなので定規を疑ってました。そんなことより猫のしっぽの長さを測りたいです。",
    alt: "しっぽを並べるトラちゃん、キキ、フワと、定規の横にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-23",
    title: "かけっこ勝負",
    body: "なおくんは猫より速く転がれると言い張りました。トラちゃんが一回つついたら壁まで一直線でした。そんなことよりトラちゃんと走りたいです。",
    alt: "元気に走るトラちゃんと、クッションの前まで転がった顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-08-22",
    title: "チョコの箱",
    body: "なおくんはチョコレートの箱にまぎれようとしました。お母さんに一秒で見つかりました。そんなことより猫のおやつを用意したいです。",
    alt: "猫のおやつを待つトラちゃん、キキ、フワと、空の菓子箱の外にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-21",
    title: "金色の夢",
    body: "なおくんは金色のうんちになる夢を見ました。起きてもいつもの茶色でした。そんなことより猫と朝のひなたぼっこをしたいです。",
    alt: "朝日を浴びるフワとキキ、金色の紙冠のそばにいる顔のない茶色いうんち姿のなおくん",
    collectionId: "naokun-poop-gold",
    catIds: ["cat-kuro", "cat-yuki"],
  }),
  diary({
    date: "2026-08-20",
    title: "雨の予報",
    body: "なおくんは雨が降る前は少しやわらかくなるそうです。聞かなかったことにします。キキと窓から雲を観察したいです。",
    alt: "窓から雲を観察するキキと、湿度計のそばにいる顔のないうんち姿のなおくん",
    catIds: ["cat-kuro"],
  }),
  diary({
    date: "2026-08-19",
    title: "夏休みの宿題",
    body: "なおくんの夏休みの宿題は、お母さんに近づかないことになりました。もう三回失敗してます。私は猫と宿題を終わらせたいです。",
    alt: "ノートを囲むトラちゃんとキキ、離れた場所にいる顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-kuro"],
  }),
  diary({
    date: "2026-08-18",
    title: "またとけました",
    body: "なおくんは暑さでまた少しとけました。冷房をつけたら元に戻ったので便利です。そんなことよりフワと涼しい部屋で寝たいです。",
    alt: "涼しい部屋で眠るフワと、保冷剤のそばにいる顔のない少し平たいうんち姿のなおくん",
    catIds: ["cat-yuki"],
  }),
  diary({
    date: "2026-08-17",
    title: "ティッシュの王様",
    body: "なおくんはティッシュ箱を王様のいすにしました。キキが先に座ったので国を取られました。私はキキの国民になります。",
    alt: "ティッシュ箱の上に座るキキと、紙の王冠のそばにいる顔のないうんち姿のなおくん",
    catIds: ["cat-kuro"],
  }),
  diary({
    date: "2026-08-16",
    title: "おばけの正体",
    body: "なおくんは白い布をかぶっておばけになりました。布を取ったあとのほうが怖いと言われてました。そんなことより猫とかくれんぼしたいです。",
    alt: "白い布のかくれんぼをするトラちゃん、キキ、フワと、布の外にいる顔のないうんち姿のなおくん",
    collectionId: "naokun-poop-ghost",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-15",
    title: "セミより大きなもの",
    body: "なおくんはセミの声に負けないように一日中しゃべってました。うるささだけは勝ちました。そんなことより猫と夏の音を聞きたいです。",
    alt: "窓辺でセミの声を聞くトラちゃんとフワ、少し離れている顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-yuki"],
  }),
  diary({
    date: "2026-08-14",
    title: "すいかの植木鉢",
    body: "なおくんの上にすいかの種が落ちました。植木鉢に選ばれたと喜んでました。そんなことより猫とすいかの模様を観察したいです。",
    alt: "すいかを観察するトラちゃんとキキ、種が一粒のった顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-kuro"],
  }),
  diary({
    date: "2026-08-13",
    title: "帰る場所",
    body: "なおくんはお盆に帰る場所を聞かれて、トイレと答えました。誰も止めませんでした。そんなことより猫と灯りをながめたいです。",
    alt: "やさしい提灯の光をながめるトラちゃん、キキ、フワと、廊下の端にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-12",
    title: "動かない船長",
    body: "なおくんは段ボール船のうんち船長になりました。船はテープで床に固定されてました。そんなことより猫と海賊ごっこしたいです。",
    alt: "段ボール船で海賊ごっこをするトラちゃんとキキ、船長帽のそばにいる顔のないうんち姿のなおくん",
    collectionId: "naokun-poop-pirate",
    catIds: ["cat-maron", "cat-kuro"],
  }),
  diary({
    date: "2026-08-11",
    title: "洗濯物の下",
    body: "なおくんは洗濯物の下なら涼しいと言って動きません。お母さんはそこだけ洗い直すそうです。私は猫と白いシーツで遊びたいです。",
    alt: "白いシーツの間で遊ぶキキとフワ、物干しの端にいる顔のないうんち姿のなおくん",
    catIds: ["cat-kuro", "cat-yuki"],
  }),
  diary({
    date: "2026-08-10",
    title: "帽子をかぶった帽子",
    body: "なおくんは小さな帽子をかぶっておしゃれしました。うんちに帽子が乗っただけでした。そんなことよりトラちゃんと新聞を読みたいです。",
    alt: "新聞の上に座るトラちゃんと、小さな麦わら帽子をのせた顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-08-09",
    title: "クッション登山",
    body: "なおくんは山登りをしたと自慢してました。登ったのはソファのクッション一個です。そんなことより猫と段ボールの山を作りたいです。",
    alt: "段ボール箱の山で遊ぶトラちゃん、キキ、フワと、クッションの上にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-08",
    title: "うんち記念日",
    body: "なおくんは今日は世界うんちの日だと言い張ってます。なおくんにとっては毎日そうだと思います。私は猫と世界地図を見たいです。",
    alt: "世界地図を囲むトラちゃん、キキ、フワと、地球儀の下にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-07",
    title: "うちわのダンス",
    body: "なおくんはうちわの風で踊ってるつもりでした。床を三センチずつ動いてただけです。そんなことより猫と盆踊りしたいです。",
    alt: "小さな夏祭りの飾りで遊ぶトラちゃんとフワ、うちわの風で動く顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-yuki"],
  }),
  diary({
    date: "2026-08-06",
    title: "すごい一句",
    body: "なおくんは『うんちはうんち』という詩を書きました。自分で金賞にしてました。そんなことよりキキと面白い本を読みたいです。",
    alt: "本を読むキキと、金色の紙メダルのそばにいる顔のないうんち姿のなおくん",
    collectionId: "naokun-poop-artist",
    catIds: ["cat-kuro"],
  }),
  diary({
    date: "2026-08-05",
    title: "洗面器の水泳",
    body: "なおくんは洗面器で水泳の練習を始めました。排水口が近すぎてすぐ中止になりました。そんなことより猫と扇風機の前にいたいです。",
    alt: "扇風機の前で涼むトラちゃんとキキ、空の洗面器の横にいる顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-kuro"],
  }),
  diary({
    date: "2026-08-04",
    title: "カレーに入れません",
    body: "なおくんはカレーにまぎれられると言い出しました。お母さんに台所から追い出されました。そんなことより猫と晩ご飯を食べたいです。",
    alt: "晩ご飯を待つトラちゃん、キキ、フワと、台所の外にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-03",
    title: "茶色いかき氷",
    body: "なおくんはかき氷に茶色いシロップをかけようとしました。お母さんが遠くから止めました。そんなことより猫と夏のおやつを食べたいです。",
    alt: "涼しいおやつを囲むトラちゃんとフワ、台から離されている顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-yuki"],
  }),
  diary({
    date: "2026-08-02",
    title: "ころがる体操",
    body: "なおくんは朝の体操を始めました。体を曲げるかわりに床を一周しました。そんなことより猫とゆっくり伸びをしたいです。",
    alt: "朝の伸びをするトラちゃん、キキ、フワと、床を転がる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-08-01",
    title: "八月はだれの月",
    body: "なおくんは八月をうんち月間にすると発表しました。理由はとくにないそうです。そんなことより猫の予定をカレンダーに書きたいです。",
    alt: "夏のカレンダーを囲むトラちゃん、キキ、フワと、隅にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-31",
    title: "洗ったらどうなる",
    body: "なおくんは自分を洗ったら消えるのか心配してました。トラちゃんが水の入ってない洗面器を見せました。研究は明日にします。",
    alt: "空の洗面器をのぞくトラちゃんと、少し離れている顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-07-30",
    title: "花火の正体",
    body: "なおくんは花火を空で爆発するうんちだと説明しました。今すぐ忘れたいです。そんなことより猫ときれいな花火を見たいです。",
    alt: "窓から花火をながめるトラちゃん、キキ、フワと、部屋の隅にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-29",
    title: "うんち王国",
    body: "なおくんはトイレットペーパーの芯を王冠にしました。うんち王国の王様らしいです。そんなことより猫と段ボールのお城を作りたいです。",
    alt: "段ボールのお城で遊ぶトラちゃんとキキ、紙の王冠をのせた顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-kuro"],
  }),
  diary({
    date: "2026-07-28",
    title: "写真のすみっこ",
    body: "なおくんは猫の記念写真に入ろうとしました。トラちゃんのしっぽで全部かくれました。そんなことより猫だけの写真を飾りたいです。",
    alt: "記念写真を撮るトラちゃん、キキ、フワと、トラちゃんのしっぽに隠れた顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-27",
    title: "個性のにおい",
    body: "なおくんはにおいも個性だと言い張ってます。家中の窓が開けられました。そんなことより猫と涼しい風にあたりたいです。",
    alt: "開いた窓で風を楽しむキキとフワ、遠くにいる顔のないうんち姿のなおくん",
    catIds: ["cat-kuro", "cat-yuki"],
  }),
  diary({
    date: "2026-07-26",
    title: "アイスにはのれません",
    body: "なおくんはアイスの上にのれば人気者になれると思ってました。台所に入る前に止められました。猫と本物のおやつを食べたいです。",
    alt: "猫用おやつを待つトラちゃん、キキ、フワと、台所の外にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-25",
    title: "影もうんち",
    body: "なおくんは自分の影までうんちの形だと落ち込んでました。ほかの形になるほうが怖いです。そんなことより猫の影を追いかけたいです。",
    alt: "夕方の長い影で遊ぶトラちゃんとキキ、うんち形の影を落とす顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-kuro"],
  }),
  diary({
    date: "2026-07-24",
    title: "三センチ飛行",
    body: "なおくんは扇風機で空を飛ぼうとしました。三センチ転がってソファの下へ消えました。キキと捜索しないとです。",
    alt: "ソファの下を捜すキキと、奥に転がった顔のないうんち姿のなおくん",
    catIds: ["cat-kuro"],
  }),
  diary({
    date: "2026-07-23",
    title: "うんちカーリング",
    body: "なおくんはカーリングの石になりました。全然すべらないので開始前に負けました。そんなことより猫と丸めた紙で遊びたいです。",
    alt: "丸めた紙を追うトラちゃんとキキ、カーリングの的にいる顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-kuro"],
  }),
  diary({
    date: "2026-07-22",
    title: "お客さんは寝てました",
    body: "なおくんはうんちアイドルとして歌い始めました。お客さんの猫は三匹とも寝てました。私もフワの隣で寝たいです。",
    alt: "小さな音楽会ですやすや眠るトラちゃん、キキ、フワと、マイクのそばにいる顔のないうんち姿のなおくん",
    collectionId: "naokun-poop-music",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-21",
    title: "怖い話",
    body: "なおくんは夏らしく怖い話をしてくれました。主人公が自分だったので最初から正体がばれてました。そんなことよりフワと毛布に入りたいです。",
    alt: "毛布にくるまるフワと、小さな懐中電灯のそばにいる顔のないうんち姿のなおくん",
    catIds: ["cat-yuki"],
  }),
  diary({
    date: "2026-07-20",
    title: "少しだけ平ら",
    body: "なおくんは暑さで少し平らになりました。お母さんが床からはがして元に戻しました。そんなことより猫と冷たい部屋へ行きたいです。",
    alt: "冷たいマットで涼むトラちゃん、キキ、フワと、少し平たい顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-19",
    title: "なおくんの家",
    body: "なおくんは猫のトイレを自分の家にしたいと言いました。キキが砂をかけるまねをしたら考え直しました。掃除は私がします。",
    alt: "きれいな猫用トイレのそばにいるキキと、入口で止まる顔のないうんち姿のなおくん",
    catIds: ["cat-kuro"],
  }),
  diary({
    date: "2026-07-18",
    title: "植木鉢には入りません",
    body: "なおくんは植物の栄養になれると自信満々でした。お母さんが植木鉢を全部高い所へ移しました。猫と葉っぱを観察したいです。",
    alt: "安全な棚の植物を見上げるトラちゃんとフワ、床にいる顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-yuki"],
  }),
  diary({
    date: "2026-07-17",
    title: "釣れたのは紙",
    body: "なおくんは釣りをしたらトイレットペーパーが釣れました。大物だと喜んでました。そんなことよりトラちゃんと魚のおもちゃで遊びたいです。",
    alt: "魚のおもちゃを狙うトラちゃんと、紙のロールのそばにいる顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-07-16",
    title: "犯人はいつも同じ",
    body: "なおくんは名探偵になってうんち事件を調べました。鏡を見たところで捜査が終わりました。そんなことよりキキと本物の謎を解きたいです。",
    alt: "虫眼鏡で手がかりを探すキキと、鏡の前にいる顔のないうんち姿のなおくん",
    collectionId: "naokun-poop-detective",
    catIds: ["cat-kuro"],
  }),
  diary({
    date: "2026-07-15",
    title: "七色の説明",
    body: "なおくんは虹を七色のうんちの道だと説明しました。せっかくきれいだったのに台無しです。そんなことより猫と虹を見たいです。",
    alt: "窓辺で虹をながめるトラちゃん、キキ、フワと、虹色の紙のそばにいる顔のないうんち姿のなおくん",
    collectionId: "naokun-poop-rainbow",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-14",
    title: "三段がおしゃれ",
    body: "なおくんは三段になってるところがおしゃれだと言い張ってます。トラちゃんが一番上をじっと見てました。そんなことより猫の毛を整えたいです。",
    alt: "ブラシを待つトラちゃんと、三段の形をした顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-07-13",
    title: "帽子の中身",
    body: "なおくんは大きな帽子にかくれて別人のふりをしました。下からうんちが見えてました。そんなことより猫と着せ替えごっこしたいです。",
    alt: "帽子やリボンで遊ぶトラちゃんとフワ、帽子から見えている顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-yuki"],
  }),
  diary({
    date: "2026-07-12",
    title: "香水の結果",
    body: "なおくんはいい香りになろうとして香水をつけました。いろいろなにおいが混ざりました。そんなことよりキキと窓辺で涼みたいです。",
    alt: "開いた窓辺で涼むキキと、香水瓶から遠く離れた顔のないうんち姿のなおくん",
    catIds: ["cat-kuro"],
  }),
  diary({
    date: "2026-07-11",
    title: "冷蔵庫は禁止",
    body: "なおくんは暑いから冷蔵庫に入ろうとしました。お母さんに見つかって家で一番大きな声が出ました。猫と氷をながめて涼みたいです。",
    alt: "氷の入った器をながめるトラちゃん、キキ、フワと、台所の外にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-10",
    title: "夏のボーナス",
    body: "なおくんはうんちにも夏のボーナスが出ると言ってました。もらったのはトイレットペーパー一個です。そんなことより猫の写真を撮りたいです。",
    alt: "カメラの前に並ぶトラちゃん、キキ、フワと、紙のロールの横にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-09",
    title: "遊んでもらえました",
    body: "なおくんは猫が遊んでくれないと文句を言ってました。トラちゃんが前足で転がしたら急に静かになりました。私もトラちゃんと遊びたいです。",
    alt: "前足を伸ばすトラちゃんと、ボールのように少し転がる顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-07-08",
    title: "うんち紳士",
    body: "なおくんはうんち紳士として丁寧におじぎしました。丸いのでそのまま前へ転がりました。そんなことより猫とお茶会したいです。",
    alt: "小さなお茶会をするキキとフワ、蝶ネクタイのそばで転がる顔のないうんち姿のなおくん",
    catIds: ["cat-kuro", "cat-yuki"],
  }),
  diary({
    date: "2026-07-07",
    title: "七夕のお願い",
    body: "なおくんは短冊に『流されませんように』と書いてました。願いごとがとても具体的です。そんなことより猫と星を見たいです。",
    alt: "七夕飾りと星を見上げるトラちゃん、キキ、フワ、短冊の下にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-06",
    title: "星のつぶつぶ",
    body: "なおくんは星を空のうんちのつぶだと思ってました。フワが聞いてなくて助かりました。そんなことよりフワとお願いごとを考えたいです。",
    alt: "夜空の星を見上げるフワと、星形の紙の下にいる顔のないうんち姿のなおくん",
    catIds: ["cat-yuki"],
  }),
  diary({
    date: "2026-07-05",
    title: "天日干し",
    body: "なおくんは日なたで乾いて強くなると言ってました。少し小さくなっただけでした。そんなことより猫とひなたぼっこしたいです。",
    alt: "日なたでくつろぐトラちゃん、キキ、フワと、少し小さくなった顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-04",
    title: "だらだらの日",
    body: MIYUKI_REFERENCE_ENTRIES["2026-07-04"],
    alt: "ソファでだらだらするトラちゃん、キキ、フワと、床で動かない顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-03",
    title: "トラちゃんの飛び蹴り",
    body: MIYUKI_REFERENCE_ENTRIES["2026-07-03"],
    alt: "顔のないうんち姿のなおくんへ漫画のように軽く飛び蹴りするトラちゃんと、お絵描き道具",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-07-02",
    title: "ソファのしみ",
    body: MIYUKI_REFERENCE_ENTRIES["2026-07-02"],
    alt: "トラちゃん、キキ、フワがくつろぐソファと、掃除道具のそばにいる顔のない少しとけたうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-07-01",
    title: "とけそうな日",
    body: MIYUKI_REFERENCE_ENTRIES["2026-07-01"],
    alt: "涼しい部屋でくつろぐトラちゃん、キキ、フワと、保冷剤のそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-06-30",
    title: "工作とうんち",
    body: MIYUKI_REFERENCE_ENTRIES["2026-06-30"],
    alt: "工作とブラシを囲むトラちゃん、キキ、フワと、作品から離れている顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-06-29",
    title: "トラちゃんの研究",
    body: MIYUKI_REFERENCE_ENTRIES["2026-06-29"],
    alt: "虫眼鏡とノートで顔のないうんち姿のなおくんを研究するトラちゃん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2026-06-28",
    title: "なおくんのライバル",
    body: MIYUKI_REFERENCE_ENTRIES["2026-06-28"],
    alt: "トラちゃん、キキ、フワのきれいな猫用トイレと、対決札のそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-06-27",
    title: "前世も今世も",
    body: MIYUKI_REFERENCE_ENTRIES["2026-06-27"],
    alt: "猫の図鑑を囲むトラちゃん、キキ、フワと、古い写真のそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-06-26",
    title: "呪われてませんでした",
    body: MIYUKI_REFERENCE_ENTRIES["2026-06-26"],
    alt: "ご飯を待つトラちゃん、キキ、フワと、お守りのそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-06-25",
    title: "お祓いへ行きました",
    body: MIYUKI_REFERENCE_ENTRIES["2026-06-25"],
    alt: "トランプを囲むトラちゃん、キキ、フワと、お祓いのお札のそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-06-24",
    title: "うんちを越えました",
    body: MIYUKI_REFERENCE_ENTRIES["2026-06-24"],
    alt: "毛糸でじゃれ合うトラちゃん、キキ、フワと、離れたトレーにいる顔のないやわらかいうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-06-23",
    title: "ネットで話題の妖精",
    body: MIYUKI_REFERENCE_ENTRIES["2026-06-23"],
    alt: "散歩の準備をするトラちゃん、キキ、フワと、妖精の羽がついた顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2026-06-22",
    title: "雨で流される心配",
    body: MIYUKI_REFERENCE_ENTRIES["2026-06-22"],
    alt: "雨の窓辺で昼寝するトラちゃん、キキ、フワと、床にいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2025-08-31",
    title: "一ページの自由研究",
    body: "なおくんは『うんちの気持ち』という自由研究を書きました。一ページだけですが本人なので十分らしいです。私は猫と工作を完成させたいです。",
    alt: "自由研究の工作を囲むトラちゃん、キキ、フワと、一枚の紙のそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2025-08-30",
    title: "毎日同じ身長",
    body: "なおくんは毎朝うんちの高さを測ってました。昨日より低いのは少しつぶれただけです。そんなことより猫と積み木を高くしたいです。",
    alt: "積み木を高く積むトラちゃんとキキ、定規の横にいる顔のない少し平たいうんち姿のなおくん",
    catIds: ["cat-maron", "cat-kuro"],
  }),
  diary({
    date: "2025-08-29",
    title: "行き先はトイレ",
    body: "なおくんはうんち用のパスポートを作りました。行き先はトイレしか書いてませんでした。そんなことより猫と電車ごっこしたいです。",
    alt: "段ボール電車で遊ぶトラちゃん、キキ、フワと、小さなパスポートのそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2025-08-17",
    title: "猫の仲間入り",
    body: "なおくんは猫の仲間に入れてほしいと言いました。キキが猫砂を持ってきたらすぐ逃げました。そんなことより猫と昼寝したいです。",
    alt: "猫用クッションでくつろぐキキとフワ、猫砂から離れている顔のないうんち姿のなおくん",
    catIds: ["cat-kuro", "cat-yuki"],
  }),
  diary({
    date: "2025-08-16",
    title: "リボンをつけました",
    body: "なおくんはうんちに大きなリボンをつけてお祝いに来ました。プレゼントではないそうです。そんなことより猫とパーティーしたいです。",
    alt: "誕生日飾りを囲むトラちゃん、キキ、フワと、大きなリボンをつけた顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2025-08-15",
    title: "水には浮きません",
    body: "なおくんはうんちだから水に浮けると言い張りました。浅い洗面器の底で止まってました。そんなことより猫と水遊びしたいです。",
    alt: "水に浮かぶおもちゃで遊ぶトラちゃんとキキ、空の洗面器の横にいる顔のないうんち姿のなおくん",
    catIds: ["cat-maron", "cat-kuro"],
  }),
  diary({
    date: "2025-08-14",
    title: "うちわの風",
    body: "なおくんはうちわで自分のにおいを遠くへ飛ばしてました。遠くにいたお母さんが怒ってました。そんなことよりトラちゃんをブラッシングしたいです。",
    alt: "ブラッシングを待つトラちゃんと、うちわの前にいる顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
  diary({
    date: "2025-08-13",
    title: "流れ星のお願い",
    body: "なおくんは流れ星にもっと立派なうんちになりたいとお願いしました。今のままで十分です。そんなことよりフワと星を見たいです。",
    alt: "夜空の流れ星を見上げるフワと、小さな望遠鏡のそばにいる顔のないうんち姿のなおくん",
    catIds: ["cat-yuki"],
  }),
  diary({
    date: "2025-08-12",
    title: "夏限定らしいです",
    body: "なおくんは自分を夏限定のうんちだと言い張ってました。どこが限定なのかは教えてくれません。そんなことより猫とシャボン玉を追いたいです。",
    alt: "シャボン玉を追うトラちゃん、キキ、フワと、麦わら帽子のそばにいる顔のないうんち姿のなおくん",
    catIds: ALL_CATS,
  }),
  diary({
    date: "2025-08-11",
    title: "かくれんぼ失敗",
    body: "なおくんは段ボール箱にかくれました。うんちだと思われて箱ごと片づけられました。そんなことよりキキとかくれんぼしたいです。",
    alt: "段ボール箱からのぞくキキと、別の箱に入った顔のないうんち姿のなおくん",
    catIds: ["cat-kuro"],
  }),
  diary({
    date: "2025-08-10",
    title: "消化の専門家",
    body: "なおくんはうんちだから消化の専門家だと言ってました。朝ご飯のことは何も知りませんでした。そんなことよりトラちゃんと朝ご飯を食べたいです。",
    alt: "朝ご飯を待つトラちゃんと、食卓から離れている顔のないうんち姿のなおくん",
    catIds: ["cat-maron"],
  }),
]

// 古い親編集データとの互換性を保つため、全日付を図鑑対応済みとして公開します。
// collectionId がない日は通常のうんち姿で、新しい図鑑カードは解放しません。
export const DIARY_COLLECTION_BY_DATE: Readonly<Record<string, DiaryCollectionId>> = Object.fromEntries(
  DIARY_ENTRIES.map((entry) => [entry.date, entry.collectionId ?? "naokun-poop-classic"]),
)

export function validateDiaryEntries(entries: readonly DiaryEntry[]) {
  const issues: string[] = []
  const expectedEntryCount = 83
  if (entries.length !== expectedEntryCount) issues.push(`日記は${expectedEntryCount}件必要です。`)

  const dates = new Set<string>()
  const titles = new Set<string>()
  const imagePaths = new Set<string>()
  const alts = new Set<string>()

  for (const entry of entries) {
    if (dates.has(entry.date)) issues.push(entry.date + " の日付が重複しています。")
    dates.add(entry.date)

    if (titles.has(entry.title)) issues.push(entry.date + " のタイトルが重複しています。")
    titles.add(entry.title)

    const expectedImagePath = `/content/diary/${entry.date}.webp`
    if (entry.imagePath !== expectedImagePath) issues.push(entry.date + " の画像パスが日付と一致しません。")
    if (entry.illustration !== entry.imagePath) issues.push(entry.date + " の画像参照が一致しません。")
    if (imagePaths.has(entry.imagePath)) issues.push(entry.date + " の画像パスが重複しています。")
    imagePaths.add(entry.imagePath)

    if (!entry.alt.trim()) issues.push(entry.date + " の画像説明が空です。")
    if (!entry.alt.includes("顔のない")) issues.push(entry.date + " の画像説明に顔なしのなおくんが明記されていません。")
    if (alts.has(entry.alt)) issues.push(entry.date + " の画像説明が重複しています。")
    alts.add(entry.alt)

    const sentences = entry.body.split("。").map((sentence) => sentence.trim()).filter(Boolean)
    if (sentences.length < 2 || sentences.length > 3) issues.push(entry.date + " の本文は2〜3文にしてください。")
    if (entry.body.length < 25 || entry.body.length > 105) issues.push(entry.date + " の本文は25〜105文字にしてください。")
    if (!entry.body.includes("なおくん")) issues.push(entry.date + " の本文になおくんがいません。")
    if (!/(?:猫|トラちゃん|キキ|フワ)/.test(entry.body)) issues.push(entry.date + " の本文に猫の話がありません。")
    if (/(?:担当しました|うんち姿|変身しました|大ニュースです|総合優勝)/.test(entry.body)) {
      issues.push(entry.date + " に古い説明調の表現が残っています。")
    }

    if (entry.collectionId && !DIARY_COLLECTION_IDS.includes(entry.collectionId)) issues.push(entry.date + " の図鑑IDが不正です。")
    if (entry.catIds.length === 0 || entry.catIds.some((catId) => !DIARY_CAT_IDS.includes(catId))) {
      issues.push(entry.date + " の猫IDが不正です。")
    }
    if (new Set(entry.catIds).size !== entry.catIds.length) issues.push(entry.date + " の猫IDが重複しています。")
    for (const catId of entry.catIds) {
      const cat = DIARY_CAT_BY_ID[catId]
      if (cat && !(entry.title + entry.body + entry.alt).includes(cat.name)) {
        issues.push(entry.date + " の猫ID「" + catId + "」と画像説明が一致しません。")
      }
    }
  }

  for (const [date, approvedBody] of Object.entries(MIYUKI_REFERENCE_ENTRIES)) {
    const entry = entries.find((candidate) => candidate.date === date)
    if (!entry) issues.push(date + " の美雪原稿がありません。")
    else if (entry.body !== approvedBody) issues.push(date + " の美雪原稿が変更されています。")
  }

  return issues
}

export const DIARY_ENTRY_VALIDATION_ISSUES = validateDiaryEntries(DIARY_ENTRIES)
if (DIARY_ENTRY_VALIDATION_ISSUES.length > 0) {
  throw new Error("絵日記データの検証に失敗しました。\n" + DIARY_ENTRY_VALIDATION_ISSUES.join("\n"))
}

export const AVAILABLE_DIARY_MONTHS = [...new Set(DIARY_ENTRIES.map((entry) => entry.date.slice(0, 7)))].sort(
  (a, b) => b.localeCompare(a),
)
