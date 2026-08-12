export type ColoringPage = {
  id: string
  title: string
  difficulty: "easy" | "normal" | "challenge"
  difficultyLabel: string
  description: string
  svg: string
}

const frame = (content: string, label: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 340" role="img" aria-label="${label}" style="background:#fffdf8" stroke="#533a2d" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="6" width="468" height="328" rx="26" fill="white"/>
    ${content}
  </svg>`

export const COLORING_PAGES: ColoringPage[] = [
  {
    id: "hello-cat",
    title: "おすわりねこ",
    difficulty: "easy",
    difficultyLabel: "入門",
    description: "窓辺の子猫と毛糸、クッションを大きな面で塗り分けます",
    svg: frame(`
      <path data-name="壁" d="M8 8h464v234H8Z" fill="white"/>
      <path data-name="床" d="M8 242h464v90H8Z" fill="white"/>
      <path data-name="窓" d="M34 35h126v153H34Z" fill="white"/>
      <path d="M97 36v151M35 111h124" fill="none"/>
      <path data-name="左のカーテン" d="M21 25h42c-8 38 2 68-14 98 15 25 4 52 10 77H21Z" fill="white"/>
      <path data-name="右のカーテン" d="M133 25h42v175h-38c6-25-5-52 10-77-16-30-6-60-14-98Z" fill="white"/>
      <path data-name="ラグ" d="M105 279c0-27 66-48 151-48s154 21 154 48-69 46-154 46-151-19-151-46Z" fill="white"/>
      <path data-name="tail" d="M326 228c58-42 111-5 91 45-13 34-60 40-79 13-12-17 3-42 24-35 12 4 13 18 5 24 23 2 33-15 24-27-12-17-36-5-58 17Z" fill="white"/>
      <path data-name="body" d="M190 189c6-39 34-58 69-58 38 0 67 23 72 65l4 68c3 30-18 51-48 51h-66c-31 0-51-21-47-52Z" fill="white"/>
      <ellipse data-name="tummy" cx="254" cy="239" rx="42" ry="56" fill="white"/>
      <ellipse data-name="left-paw" cx="207" cy="291" rx="38" ry="20" fill="white"/>
      <ellipse data-name="right-paw" cx="299" cy="291" rx="38" ry="20" fill="white"/>
      <path data-name="face" d="M190 104c0-48 29-79 67-79 39 0 69 31 69 79 0 46-25 75-69 75-42 0-67-29-67-75Z" fill="white"/>
      <path data-name="left-ear" d="M194 78 199 23l47 28Z" fill="white"/>
      <path data-name="right-ear" d="m271 49 42-28 9 59Z" fill="white"/>
      <path data-name="左耳の内側" d="m205 61 2-24 22 15Z" fill="white"/>
      <path data-name="右耳の内側" d="m286 51 20-15 4 27Z" fill="white"/>
      <path data-name="おでこの模様" d="M231 31c8 11 9 22 2 34 11-8 22-8 34 0-7-13-5-25 5-35-13 5-27 5-41 1Z" fill="white"/>
      <path data-name="首輪" d="M204 163c29 15 76 15 105-1l-2 18c-31 13-70 13-101 0Z" fill="white"/>
      <circle data-name="首輪のメダル" cx="257" cy="185" r="12" fill="white"/>
      <path data-name="左の毛糸" d="M50 257c0-24 20-43 45-43s45 19 45 43-20 43-45 43-45-19-45-43Z" fill="white"/>
      <path data-name="右の毛糸" d="M383 286c0-18 15-33 34-33s34 15 34 33-15 32-34 32-34-14-34-32Z" fill="white"/>
      <path d="M62 238c22 5 48 22 64 43M62 271c22-8 45-24 57-43m276 43c17 3 34 14 45 29m-45 1c14-8 28-20 36-34M95 215c24-20 38-23 56-19" fill="none"/>
      <ellipse cx="232" cy="105" rx="6" ry="8" fill="#533a2d" stroke="none"/><ellipse cx="282" cy="105" rx="6" ry="8" fill="#533a2d" stroke="none"/>
      <path d="m248 126 9 6 9-6m-9 6c-2 13-16 15-23 7m23-7c2 13 16 15 23 7M211 129l-43-7m43 19-42 8m134-20 43-7m-43 19 42 8M227 87l-14-8m89 8 14-8M233 221c14 10 35 10 49 0" fill="none"/>
    `, "おすわりねこのぬりえ"),
  },
  {
    id: "cafe-cat",
    title: "ねこカフェ",
    difficulty: "normal",
    difficultyLabel: "標準",
    description: "猫店長、クリームソーダ、ショーケースのある店内を仕上げます",
    svg: frame(`
      <path data-name="店内の壁" d="M8 8h464v239H8Z" fill="white"/>
      <rect data-name="奥の窓" x="287" y="88" width="160" height="126" rx="9" fill="white"/>
      <path d="M367 89v124m-79-61h158" fill="none"/>
      <path data-name="awning-1" d="M21 30h73v47H21c-14-11-14-35 0-47Z" fill="white"/><path data-name="awning-2" d="M94 30h73v47H94Z" fill="white"/><path data-name="awning-3" d="M167 30h73v47h-73Z" fill="white"/><path data-name="awning-4" d="M240 30h73v47h-73Z" fill="white"/><path data-name="awning-5" d="M313 30h73v47h-73Z" fill="white"/><path data-name="awning-6" d="M386 30h73c14 12 14 35 0 47h-73Z" fill="white"/>
      <path data-name="店の看板" d="M181 85h119l-8 39H190Z" fill="white"/>
      <path d="M209 104c9-11 19-12 30-3 10-9 21-8 30 3-8 12-18 18-30 20-13-2-23-8-30-20Z" fill="none"/>
      <path data-name="tail" d="M86 226c-50-29-65 28-28 44 17 7 32-7 21-19-8-8-18-3-18 6" fill="white"/>
      <path data-name="body" d="M87 211c0-43 30-68 75-68s77 26 77 68v69H87Z" fill="white"/>
      <path data-name="エプロン" d="M123 178h78l17 102H106Z" fill="white"/>
      <path data-name="エプロンのポケット" d="M139 230h48v29h-48c-9-7-9-21 0-29Z" fill="white"/>
      <path data-name="face" d="M98 130c0-45 28-72 65-72s66 27 66 72c0 41-25 67-66 67s-65-26-65-67Z" fill="white"/>
      <path data-name="left-ear" d="m103 104 3-54 45 30Z" fill="white"/><path data-name="right-ear" d="m176 79 43-30 6 56Z" fill="white"/>
      <path data-name="コック帽" d="M120 58c-4-18 16-28 31-19 8-19 36-17 42 3 19-4 32 16 21 31h-91Z" fill="white"/>
      <path data-name="スカーフ" d="M123 188c23 10 56 10 79 0l-8 20-31-8-31 8Z" fill="white"/>
      <path data-name="counter" d="M22 253h436v70H22Z" fill="white"/>
      <path data-name="カウンター左パネル" d="M43 272h113v34H43Z" fill="white"/><path data-name="カウンター中央パネル" d="M181 272h113v34H181Z" fill="white"/><path data-name="カウンター右パネル" d="M319 272h113v34H319Z" fill="white"/>
      <path data-name="glass" d="M326 145h75l-11 105h-53Z" fill="white"/><path data-name="soda" d="M331 184h65l-7 62h-51Z" fill="white"/><ellipse data-name="icecream" cx="363" cy="160" rx="34" ry="28" fill="white"/><circle data-name="cherry" cx="390" cy="126" r="11" fill="white"/>
      <path data-name="ソーダのストロー" d="m373 151 18-57 9 3-18 58Z" fill="white"/>
      <path data-name="ケーキ" d="M248 221h54l-5 30h-49Z" fill="white"/><path data-name="ケーキのクリーム" d="M244 220c9-19 47-22 62 0Z" fill="white"/>
      <path d="M390 115c-2-14 8-24 21-28M131 132c7 7 15 7 22 0m22 0c7 7 15 7 22 0m-40 19 7 5 7-5m-7 5c-2 10-13 12-19 5m19-5c2 10 13 12 19 5M118 156l-30-5m30 15-29 6m120-16 30-5m-30 15 29 6M342 202h47m-43 17h39" fill="none"/>
    `, "ねこカフェのぬりえ"),
  },
  {
    id: "fish-picnic",
    title: "おさかなピクニック",
    difficulty: "normal",
    difficultyLabel: "標準",
    description: "丘、池、ピクニック猫、跳ねる魚を一つの物語として彩ります",
    svg: frame(`
      <path data-name="sky" d="M8 8h464v178H8Z" fill="white"/><path data-name="遠くの丘" d="M8 154c55-49 97-47 147 0 46-70 98-69 153 2 48-45 102-40 164 5v55H8Z" fill="white"/><path data-name="grass" d="M8 181c73-27 137 19 211-5 83-27 157 18 253-2v158H8Z" fill="white"/>
      <circle data-name="sun" cx="409" cy="56" r="31" fill="white"/>
      <path data-name="左の雲" d="M39 68c-15-18 5-37 24-28 8-23 42-19 45 5 22-5 35 23 17 36H49c-12 0-18-6-10-13Z" fill="white"/>
      <path data-name="池" d="M270 221c42-25 143-25 186 4 30 20-5 69-91 70-83 2-129-48-95-74Z" fill="white"/>
      <path data-name="ピクニックシート" d="M27 260 206 238l58 82-198 8Z" fill="white"/>
      <path d="m67 255 48 69m-3-75 49 72m-1-78 52 73M43 284l193-22m-181 49 197-22" fill="none"/>
      <path data-name="tail" d="M155 229c68-37 97 20 60 49-19 14-42-1-29-19 8-11 21-8 25 1" fill="white"/>
      <path data-name="body" d="M63 205c0-48 28-75 70-75 44 0 73 29 73 77l-4 66H68Z" fill="white"/>
      <path data-name="おなかの模様" d="M102 193c14-21 48-20 62 1l11 66H92Z" fill="white"/>
      <path data-name="face" d="M74 124c0-43 26-70 61-70s63 27 63 70c0 39-24 64-63 64s-61-25-61-64Z" fill="white"/>
      <path data-name="left-ear" d="m79 100 4-53 43 29Z" fill="white"/><path data-name="right-ear" d="m149 75 40-29 6 55Z" fill="white"/>
      <path data-name="ピクニック帽子" d="M68 68c26-29 92-33 127-4l18 18H51Z" fill="white"/>
      <path data-name="帽子のリボン" d="M95 58c28-10 61-9 86 2l-2 14H94Z" fill="white"/>
      <ellipse data-name="fish" cx="350" cy="169" rx="51" ry="31" fill="white"/><path data-name="fish-tail" d="m393 169 54-38v76Z" fill="white"/><path data-name="top-fin" d="m328 142 20-34 26 36Z" fill="white"/><path data-name="bottom-fin" d="m327 194 24 30 22-34Z" fill="white"/>
      <path data-name="魚のしま模様" d="M331 141c-11 18-11 38 0 56 12-18 12-38 0-56Zm28-2c-10 20-10 41 1 61 12-20 11-41-1-61Z" fill="white"/>
      <rect data-name="lunch-box" x="177" y="274" width="91" height="50" rx="12" fill="white"/><path data-name="rice-ball" d="m199 311 17-29 18 29Z" fill="white"/>
      <path data-name="お弁当のおかず" d="M241 289c13-11 28 1 20 15-7 12-25 5-20-15Z" fill="white"/>
      <path d="M287 271c-14-27-9-46 3-61m8 56c0-29 10-44 24-56m100 66c10-29 3-49-10-65m23 70c4-25 14-38 28-48" fill="none"/>
      <ellipse cx="112" cy="126" rx="5" ry="7" fill="#533a2d" stroke="none"/><ellipse cx="157" cy="126" rx="5" ry="7" fill="#533a2d" stroke="none"/><circle cx="329" cy="164" r="5" fill="#533a2d" stroke="none"/>
      <path d="m128 145 7 5 7-5m-7 5c-2 11-14 13-20 6m20-6c2 11 14 13 20 6M92 149l-35-6m35 17-34 8m110-19 35-6m-35 17 34 8m146 4c13 9 25 9 37 0M324 157c5-6 10-6 15 0M282 233c20 7 39 8 59 2m34 17c19 4 36 2 53-5" fill="none"/>
    `, "おさかなピクニックのぬりえ"),
  },
  {
    id: "flower-garden",
    title: "お花畑のねこ",
    difficulty: "challenge",
    difficultyLabel: "上級",
    description: "麦わら帽子の猫、花壇、じょうろ、蝶を細かく塗り分けます",
    svg: frame(`
      <path data-name="sky" d="M8 8h464v176H8Z" fill="white"/><path data-name="field" d="M8 178c69-28 135 20 205-7 78-30 159 21 259-2v163H8Z" fill="white"/>
      <path data-name="左の雲" d="M32 71c-8-18 12-32 27-24 7-22 37-20 44 1 19-6 37 16 26 33H45c-12 0-18-4-13-10Z" fill="white"/><path data-name="右の雲" d="M346 78c-7-16 10-29 25-21 8-20 35-17 40 2 18-5 33 14 23 30h-76c-11 0-16-5-12-11Z" fill="white"/>
      <path data-name="柵" d="M13 178h454v39H13Zm29-27h18v93H42Zm92 0h18v93h-18Zm92 0h18v93h-18Zm92 0h18v93h-18Zm92 0h18v93h-18Z" fill="white" fill-rule="evenodd"/>
      <path data-name="tail" d="M302 236c64-42 102 13 70 49-18 20-48 7-39-13 6-13 21-11 25-1" fill="white"/>
      <path data-name="body" d="M179 207c0-52 31-82 76-82 47 0 78 32 78 84l-5 93H183Z" fill="white"/>
      <ellipse data-name="tummy" cx="255" cy="252" rx="40" ry="52" fill="white"/>
      <path data-name="face" d="M190 132c0-45 28-73 66-73 39 0 68 28 68 73 0 42-26 69-68 69-41 0-66-27-66-69Z" fill="white"/>
      <path data-name="left-ear" d="m195 107 4-54 45 30Z" fill="white"/><path data-name="right-ear" d="m270 82 43-29 6 56Z" fill="white"/>
      <path data-name="麦わら帽子" d="M179 77c24-36 116-38 150-2l28 19H157Z" fill="white"/>
      <path data-name="帽子のリボン" d="M210 63c29-11 69-11 93 1l-2 17h-92Z" fill="white"/>
      <path data-name="前足" d="M297 216c33-12 59 12 50 42-7 23-36 30-55 12Z" fill="white"/>
      <path data-name="じょうろ" d="M337 224h75l10 69h-89Z" fill="white"/><path data-name="じょうろの取っ手" d="M357 226c1-35 54-40 61 0h-18c-6-19-25-17-27 0Z" fill="white"/><path data-name="じょうろの口" d="m337 246-63 18 4 17 59-10Z" fill="white"/>
      <path d="M274 284c-9 11-8 19 0 20 9-1 10-9 0-20Zm-13 21c-7 9-6 16 1 17 7-1 8-8-1-17Zm28 5c-7 9-6 16 1 17 7-1 8-8-1-17Z" fill="white"/>
      <path data-name="ちょうちょ左" d="M88 116c-31-18-40 20-15 31 16 7 22-9 18-19Z" fill="white"/><path data-name="ちょうちょ右" d="M94 116c31-18 40 20 15 31-16 7-22-9-18-19Z" fill="white"/><path d="M91 126v29m-1-28-12-14m14 14 13-14" fill="none"/>
      <g transform="translate(26 233)"><circle data-name="flower-1-center" cx="34" cy="34" r="10" fill="white"/><circle data-name="flower-1a" cx="34" cy="11" r="13" fill="white"/><circle data-name="flower-1b" cx="56" cy="27" r="13" fill="white"/><circle data-name="flower-1c" cx="48" cy="53" r="13" fill="white"/><circle data-name="flower-1d" cx="20" cy="53" r="13" fill="white"/><circle data-name="flower-1e" cx="12" cy="27" r="13" fill="white"/><path d="M34 65v54m0-32-24-16m24 23 25-18" fill="none"/></g>
      <g transform="translate(397 251)"><circle data-name="flower-2-center" cx="23" cy="23" r="8" fill="white"/><circle data-name="flower-2a" cx="23" cy="7" r="9" fill="white"/><circle data-name="flower-2b" cx="39" cy="20" r="9" fill="white"/><circle data-name="flower-2c" cx="31" cy="39" r="9" fill="white"/><circle data-name="flower-2d" cx="13" cy="38" r="9" fill="white"/><circle data-name="flower-2e" cx="7" cy="19" r="9" fill="white"/><path d="M23 47v34" fill="none"/></g>
      <path data-name="小さな花" d="M123 272c-16-18-31 4-17 16-17 10-2 33 14 20 6 20 34 10 27-9 20 0 23-28 3-30-5-19-30-17-27 3Z" fill="white"/>
      <ellipse cx="234" cy="133" rx="5" ry="7" fill="#533a2d" stroke="none"/><ellipse cx="279" cy="133" rx="5" ry="7" fill="#533a2d" stroke="none"/>
      <path d="m249 151 7 5 7-5m-7 5c-2 11-14 13-20 6m20-6c2 11 14 13 20 6M214 155l-35-6m35 17-34 8m111-19 35-6m-35 17 34 8M278 280c15 11 33 11 48 0m-40-2c-7 18-8 33-4 47m13-49c-1 19 3 35 12 48M279 273c-17-9-34-9-52 0" fill="none"/>
    `, "お花畑のねこのぬりえ"),
  },
  {
    id: "moon-cat",
    title: "星空のねこ",
    difficulty: "challenge",
    difficultyLabel: "上級",
    description: "大きな窓、カーテン、街の灯り、眠る猫の夜景を仕上げます",
    svg: frame(`
      <path data-name="部屋の壁" d="M8 8h464v324H8Z" fill="white"/>
      <rect data-name="night-sky" x="46" y="35" width="388" height="190" rx="14" fill="white"/>
      <path data-name="moon" d="M361 59c-34 10-41 59-9 77 22 13 49 2 60-19-33 7-57-32-51-58Z" fill="white"/>
      <path data-name="star-1" d="m91 61 8 16 18 2-13 13 3 18-16-9-16 9 3-18-13-13 18-2Z" fill="white"/><path data-name="star-2" d="m276 82 6 12 14 2-10 10 2 14-12-7-13 7 3-14-11-10 15-2Z" fill="white"/><path data-name="star-3" d="m156 126 5 11 12 1-9 9 2 12-10-6-11 6 3-12-9-9 12-1Z" fill="white"/>
      <path data-name="街の屋根" d="M48 185 91 145l30 25 44-43 41 46 42-31 37 35 45-28 37 31 67-43v88H48Z" fill="white"/>
      <path d="M82 185v-16m26 16v-20m55 19v-19m42 20v-15m48 15v-19m41 19v-17m50 17v-18m37 18v-20" fill="none"/>
      <path data-name="window" d="M32 22h416v217H32Zm17 16v184h382V38Z" fill="white" fill-rule="evenodd"/>
      <path d="M240 38v184M49 130h382" fill="none"/>
      <path data-name="左のカーテン" d="M18 20h65c-8 52 10 89-16 132 25 34 9 73 16 107H18Z" fill="white"/><path data-name="右のカーテン" d="M397 20h65v239h-65c7-34-9-73 16-107-26-43-8-80-16-132Z" fill="white"/>
      <path data-name="cushion" d="M73 278c0-35 31-55 73-55h190c43 0 72 20 72 55 0 36-29 50-72 50H146c-42 0-73-14-73-50Z" fill="white"/>
      <path data-name="毛布" d="M120 276c38-27 161-31 232 0l-18 44H135Z" fill="white"/>
      <path data-name="tail" d="M300 257c63-38 102 13 70 47-19 19-49 4-39-15 7-13 21-9 24 3" fill="white"/>
      <ellipse data-name="body" cx="239" cy="250" rx="99" ry="58" fill="white"/>
      <path data-name="face" d="M116 222c0-44 28-71 67-71s69 27 69 71c0 41-27 67-69 67-41 0-67-26-67-67Z" fill="white"/>
      <path data-name="left-ear" d="m121 198 4-53 45 29Z" fill="white"/><path data-name="right-ear" d="m197 173 43-28 7 55Z" fill="white"/>
      <path data-name="ねこの背中模様" d="M251 199c26 0 52 12 69 30-20-4-33 3-40 21-9-16-23-23-42-21 12-9 16-19 13-30Z" fill="white"/>
      <path data-name="ランプ" d="M384 267h49l-8 53h-33Z" fill="white"/><path data-name="ランプの明かり" d="M375 267c4-39 17-58 34-58s31 19 35 58Z" fill="white"/>
      <path d="M153 223c9 8 18 8 27 0m27 0c9 8 18 8 27 0m-58 18 7 5 7-5m-7 5c-2 10-13 12-19 5m19-5c2 10 13 12 19 5M141 246l-34-5m34 16-34 8m119-19 34-5m-34 16 34 8M172 278c20 9 42 9 62 0m8-26c12 18 24 24 38 17" fill="none"/>
    `, "星空のねこのぬりえ"),
  },
]

export const COLOR_PALETTE = [
  { color: "#f17469", name: "コーラル" }, { color: "#f6aeb8", name: "さくら" }, { color: "#ffcfda", name: "もも" },
  { color: "#f7d692", name: "バター" }, { color: "#f2b45f", name: "みかん" }, { color: "#f6e7a7", name: "レモン" },
  { color: "#b8d8bf", name: "ミント" }, { color: "#72a889", name: "はっぱ" }, { color: "#a7d9cf", name: "ソーダミント" },
  { color: "#91cbd8", name: "ソーダ" }, { color: "#7ea4cf", name: "あおぞら" }, { color: "#b6c7e8", name: "あじさい" },
  { color: "#d9c7e6", name: "ラベンダー" }, { color: "#b89ac8", name: "すみれ" }, { color: "#ead3c3", name: "ミルクティー" },
  { color: "#d3a374", name: "キャラメル" }, { color: "#8a6e59", name: "ココア" }, { color: "#5c3a21", name: "チョコ" },
]
