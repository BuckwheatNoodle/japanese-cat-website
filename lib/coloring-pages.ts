export type ColoringPage = {
  id: string
  title: string
  difficulty: "easy" | "normal" | "challenge"
  difficultyLabel: string
  description: string
  svg: string
}

const frame = (content: string, label: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" role="img" aria-label="${label}" style="background:#fffdf8" stroke="#5c3a21" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="8" width="344" height="244" rx="24" fill="white"/>
    ${content}
  </svg>`

export const COLORING_PAGES: ColoringPage[] = [
  {
    id: "hello-cat",
    title: "おすわりねこ",
    difficulty: "easy",
    difficultyLabel: "入門",
    description: "大きな7パーツで、配色の基本を試せます",
    svg: frame(`
      <circle data-name="face" cx="180" cy="91" r="55" fill="white"/>
      <path data-name="left-ear" d="M137 59 145 22 168 48Z" fill="white"/>
      <path data-name="right-ear" d="M192 48 216 22 223 60Z" fill="white"/>
      <ellipse data-name="body" cx="180" cy="179" rx="60" ry="58" fill="white"/>
      <ellipse data-name="tummy" cx="180" cy="187" rx="34" ry="38" fill="white"/>
      <path data-name="tail" d="M232 176c58-20 65 50 15 47-19-1-22-16-9-23 12-7 24 5 13 11" fill="white"/>
      <ellipse data-name="left-paw" cx="142" cy="223" rx="31" ry="14" fill="white"/>
      <ellipse data-name="right-paw" cx="214" cy="223" rx="31" ry="14" fill="white"/>
      <circle cx="161" cy="86" r="5" fill="#5c3a21" stroke="none"/><circle cx="199" cy="86" r="5" fill="#5c3a21" stroke="none"/>
      <path d="m174 102 6 4 6-4M180 106c-3 10-13 10-17 4m17-4c3 10 13 10 17 4M147 103h-28m29 9-26 7m91-16h28m-29 9 26 7" fill="none"/>
    `, "おすわりねこのぬりえ"),
  },
  {
    id: "cafe-cat",
    title: "ねこカフェ",
    difficulty: "normal",
    difficultyLabel: "標準",
    description: "カフェ全体の色の組み合わせを設計します",
    svg: frame(`
      <path data-name="awning-1" d="M22 35h52v35H22c-12-8-12-27 0-35Z" fill="white"/><path data-name="awning-2" d="M74 35h52v35H74Z" fill="white"/><path data-name="awning-3" d="M126 35h52v35h-52Z" fill="white"/><path data-name="awning-4" d="M178 35h52v35h-52Z" fill="white"/><path data-name="awning-5" d="M230 35h52v35h-52Z" fill="white"/><path data-name="awning-6" d="M282 35h56c12 8 12 27 0 35h-56Z" fill="white"/>
      <rect data-name="counter" x="25" y="205" width="310" height="35" rx="10" fill="white"/>
      <circle data-name="face" cx="135" cy="132" r="43" fill="white"/><path data-name="left-ear" d="m101 108 5-31 25 21Z" fill="white"/><path data-name="right-ear" d="m158 98 26-21-4 34Z" fill="white"/><ellipse data-name="body" cx="135" cy="185" rx="48" ry="33" fill="white"/><path data-name="tail" d="M174 185c45-25 56 23 28 29-14 3-21-10-12-17" fill="white"/>
      <path data-name="glass" d="M235 112h65l-9 91h-47Z" fill="white"/><path data-name="soda" d="M240 145h55l-6 54h-44Z" fill="white"/><ellipse data-name="icecream" cx="267" cy="127" rx="28" ry="24" fill="white"/><circle data-name="cherry" cx="289" cy="101" r="10" fill="white"/><path d="M289 91c-2-16 7-22 15-26" fill="none"/>
      <circle cx="121" cy="128" r="4" fill="#5c3a21" stroke="none"/><circle cx="149" cy="128" r="4" fill="#5c3a21" stroke="none"/><path d="m130 141 5 3 5-3m0 3c0 8-10 9-13 4m13-4c0 8 10 9 13 4" fill="none"/>
    `, "ねこカフェのぬりえ"),
  },
  {
    id: "fish-picnic",
    title: "おさかなピクニック",
    difficulty: "normal",
    difficultyLabel: "標準",
    description: "空・草・猫・魚の配色バランスに挑戦",
    svg: frame(`
      <path data-name="sky" d="M9 9h342v118H9Z" fill="white"/><path data-name="grass" d="M9 127c55-22 98 18 154-4s108 10 188-3v131H9Z" fill="white"/><circle data-name="sun" cx="304" cy="50" r="24" fill="white"/>
      <circle data-name="face" cx="112" cy="112" r="39" fill="white"/><path data-name="left-ear" d="m82 91 3-31 25 20Z" fill="white"/><path data-name="right-ear" d="m134 80 24-20 1 32Z" fill="white"/><ellipse data-name="body" cx="112" cy="170" rx="45" ry="42" fill="white"/><path data-name="tail" d="M149 176c47-34 68 19 35 37-13 7-26-4-18-15" fill="white"/>
      <ellipse data-name="fish" cx="246" cy="135" rx="45" ry="28" fill="white"/><path data-name="fish-tail" d="m286 135 42-30v60Z" fill="white"/><path data-name="top-fin" d="m232 108 12-27 22 30Z" fill="white"/><path data-name="bottom-fin" d="m229 160 16 25 17-28Z" fill="white"/>
      <circle data-name="lunch-box" cx="239" cy="211" r="25" fill="white"/><circle data-name="rice-ball" cx="239" cy="211" r="12" fill="white"/>
      <circle cx="99" cy="108" r="4" fill="#5c3a21" stroke="none"/><circle cx="125" cy="108" r="4" fill="#5c3a21" stroke="none"/><path d="m107 120 5 3 5-3m0 3c0 7-9 8-12 4m12-4c0 7 9 8 12 4" fill="none"/><circle cx="232" cy="130" r="4" fill="#5c3a21" stroke="none"/>
    `, "おさかなピクニックのぬりえ"),
  },
  {
    id: "flower-garden",
    title: "お花畑のねこ",
    difficulty: "challenge",
    difficultyLabel: "上級",
    description: "細かな花びらを含む上級デザイン",
    svg: frame(`
      <path data-name="sky" d="M9 9h342v150H9Z" fill="white"/><path data-name="field" d="M9 157c58-23 113 15 169-5s106 15 173-3v102H9Z" fill="white"/>
      <circle data-name="face" cx="180" cy="95" r="44" fill="white"/><path data-name="left-ear" d="m145 72 5-35 28 24Z" fill="white"/><path data-name="right-ear" d="m183 61 28-24 5 36Z" fill="white"/><ellipse data-name="body" cx="180" cy="164" rx="52" ry="52" fill="white"/><ellipse data-name="tummy" cx="180" cy="174" rx="29" ry="35" fill="white"/><path data-name="tail" d="M225 166c51-26 72 28 39 50-17 11-33-3-23-16" fill="white"/>
      <g transform="translate(34 164)"><circle data-name="flower-1-center" cx="26" cy="26" r="9" fill="white"/><circle data-name="flower-1a" cx="26" cy="8" r="10" fill="white"/><circle data-name="flower-1b" cx="43" cy="20" r="10" fill="white"/><circle data-name="flower-1c" cx="36" cy="42" r="10" fill="white"/><circle data-name="flower-1d" cx="16" cy="42" r="10" fill="white"/><circle data-name="flower-1e" cx="9" cy="20" r="10" fill="white"/><path d="M26 52v35" fill="none"/></g>
      <g transform="translate(275 177)"><circle data-name="flower-2-center" cx="20" cy="20" r="7" fill="white"/><circle data-name="flower-2a" cx="20" cy="6" r="8" fill="white"/><circle data-name="flower-2b" cx="34" cy="18" r="8" fill="white"/><circle data-name="flower-2c" cx="26" cy="33" r="8" fill="white"/><circle data-name="flower-2d" cx="10" cy="31" r="8" fill="white"/><circle data-name="flower-2e" cx="6" cy="15" r="8" fill="white"/><path d="M20 40v27" fill="none"/></g>
      <circle cx="165" cy="91" r="4" fill="#5c3a21" stroke="none"/><circle cx="195" cy="91" r="4" fill="#5c3a21" stroke="none"/><path d="m175 105 5 3 5-3m0 3c0 8-10 9-14 4m14-4c0 8 10 9 14 4" fill="none"/>
    `, "お花畑のねこのぬりえ"),
  },
  {
    id: "moon-cat",
    title: "星空のねこ",
    difficulty: "challenge",
    difficultyLabel: "上級",
    description: "月・星・室内の明暗を組み立てる上級デザイン",
    svg: frame(`
      <rect data-name="night-sky" x="9" y="9" width="342" height="172" rx="22" fill="white"/><path data-name="moon" d="M288 39c-30 7-36 48-10 63 17 10 38 2 47-13-26 5-44-26-37-50Z" fill="white"/>
      <path data-name="star-1" d="m56 45 7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="white"/><path data-name="star-2" d="m241 76 5 10 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2Z" fill="white"/><path data-name="star-3" d="m102 112 4 9 10 1-7 7 1 10-8-5-9 5 2-10-8-7 10-1Z" fill="white"/>
      <path data-name="window" d="M29 27h125v142H29Z" fill="white"/><path d="M91 28v141M30 99h123" fill="none"/><path data-name="cushion" d="M91 190c0-22 18-37 43-37h92c25 0 43 15 43 37s-18 43-43 43h-92c-25 0-43-21-43-43Z" fill="white"/>
      <circle data-name="face" cx="178" cy="132" r="40" fill="white"/><path data-name="left-ear" d="m147 108 3-31 24 21Z" fill="white"/><path data-name="right-ear" d="m184 98 24-21 2 33Z" fill="white"/><ellipse data-name="body" cx="181" cy="190" rx="48" ry="36" fill="white"/><path data-name="tail" d="M219 190c51-25 61 30 26 35-13 2-22-9-14-17" fill="white"/>
      <circle cx="165" cy="127" r="4" fill="#5c3a21" stroke="none"/><circle cx="191" cy="127" r="4" fill="#5c3a21" stroke="none"/><path d="m173 139 5 3 5-3m0 3c0 7-9 8-12 4m12-4c0 7 9 8 12 4" fill="none"/>
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
