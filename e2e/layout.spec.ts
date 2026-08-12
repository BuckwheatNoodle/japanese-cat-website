import { test, expect, type Page } from "@playwright/test"

const PRIMARY_TABS = ["home", "games", "coloring", "fortune", "diary"] as const

async function openPrimaryTab(page: Page, tab: typeof PRIMARY_TABS[number]) {
  await page.getByTestId(`tab-${tab}`).click()
  await expect(page.getByTestId(`tab-${tab}`)).toHaveAttribute("aria-current", "page")
}

test.describe("レイアウト基本テスト", () => {
  test("ページが正常に読み込まれる", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1")).toContainText("美雪の猫ページ")
  })

  test("ボトムタブが表示される", async ({ page }) => {
    await page.goto("/")
    const tabs = page.locator("[data-testid='bottom-tabs']")
    await expect(tabs).toBeVisible()
  })

  test("主要なボトムタブがそろっている", async ({ page }) => {
    await page.goto("/")
    for (const tab of PRIMARY_TABS) {
      await expect(page.getByTestId(`tab-${tab}`)).toBeVisible()
    }
  })

  test("ボトムタブが画面下部に固定されている", async ({ page }) => {
    await page.goto("/")
    const tabs = page.locator("[data-testid='bottom-tabs']")
    const box = await tabs.boundingBox()
    const viewport = page.viewportSize()!
    // タブの下端がビューポート下端付近にある
    expect(box).not.toBeNull()
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThan(viewport.height - 10)
  })

  test("ホームタブがデフォルトで選択されている", async ({ page }) => {
    await page.goto("/")
    const homeTab = page.getByTestId("tab-home")
    await expect(homeTab).toHaveAttribute("aria-current", "page")
  })

  test("ヘッダーが表示される", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("header")).toBeVisible()
  })
})

test.describe("タブ切替テスト", () => {
  test("ゲームタブに切り替えられる", async ({ page }) => {
    await page.goto("/")
    await openPrimaryTab(page, "games")
    await expect(page.getByTestId("games-content")).toBeVisible()
  })

  test("ぬりえタブに切り替えられる", async ({ page }) => {
    await page.goto("/")
    await openPrimaryTab(page, "coloring")
    await expect(page.getByTestId("coloring-content")).toBeVisible()
  })

  test("占いタブに切り替えられる", async ({ page }) => {
    await page.goto("/")
    await openPrimaryTab(page, "fortune")
    await expect(page.getByTestId("fortune-content")).toBeVisible()
  })

  test("日記タブに切り替えられる", async ({ page }) => {
    await page.goto("/")
    await openPrimaryTab(page, "diary")
    await expect(page.getByTestId("diary-content")).toBeVisible()
  })

  test("タブ切替でコンテンツが変わる", async ({ page }) => {
    await page.goto("/")
    // ホーム → ゲーム → ホーム
    await expect(page.getByTestId("home-content")).toBeVisible()
    await openPrimaryTab(page, "games")
    await expect(page.getByTestId("home-content")).not.toBeVisible()
    await expect(page.getByTestId("games-content")).toBeVisible()
    await openPrimaryTab(page, "home")
    await expect(page.getByTestId("home-content")).toBeVisible()
  })
})

test.describe("ホームタブ", () => {
  test("ねこカフェの案内とゲームボタンが表示される", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "美雪のねこカフェ、今日も開店中" })).toBeAttached()
    await expect(page.getByRole("button", { name: /ゲームを選ぶ/ })).toBeVisible()
  })

  test("ねこカフェ活動ログが表示される", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "ねこカフェ活動ログ" })).toBeVisible()
  })
})

test.describe("ゲームタブ", () => {
  test("ゲーム一覧がカードグリッドで表示される", async ({ page }) => {
    await page.goto("/")
    await openPrimaryTab(page, "games")
    const cards = page.getByTestId("games-content").getByTestId("game-card")
    await expect(cards).toHaveCount(6)
    await expect(cards.first()).toBeVisible()
  })

  test("ゲームカードをタップすると展開される", async ({ page }) => {
    await page.goto("/")
    await openPrimaryTab(page, "games")
    await page.getByTestId("game-card").first().click()
    await expect(page.getByTestId("game-expanded")).toBeVisible()
  })

  test("展開したゲームから一覧に戻れる", async ({ page }) => {
    await page.goto("/")
    await openPrimaryTab(page, "games")
    await page.getByTestId("game-card").first().click()
    await page.getByTestId("game-back-button").click()
    await expect(page.getByTestId("game-card").first()).toBeVisible()
  })
})

test.describe("なおくん表示範囲と三匹の正史", () => {
  test("日記と変身セレクト以外にはなおくんを表示しない", async ({ page }) => {
    const browserErrors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text())
    })
    page.on("pageerror", (error) => browserErrors.push(error.message))

    await page.goto("/")
    await expect(page.getByText("今日のなおくん")).toHaveCount(0)
    await expect(page.locator("body")).not.toContainText("なおくん")
    await expect(page.locator('img[alt*="活動パスポートを持つ美雪と、トラちゃん、キキ、フワ"]')).toHaveCount(1)

    await openPrimaryTab(page, "games")
    await expect(page.getByText("なおくん変身セレクト", { exact: true })).toHaveCount(1)
    await expect(page.getByText("トラちゃん・フワ・キキを見分けて保護。犬は見送る", { exact: true })).toBeVisible()
    await expect(page.getByTestId("games-content")).not.toContainText("なおくんと犬")

    await openPrimaryTab(page, "coloring")
    await expect(page.getByTestId("coloring-content")).not.toContainText("なおくん")
    await openPrimaryTab(page, "fortune")
    await expect(page.getByTestId("fortune-content")).not.toContainText("なおくん")

    await openPrimaryTab(page, "diary")
    const diary = page.getByTestId("diary-content")
    await expect(diary).toContainText("いつもの3匹")
    await expect(diary).toContainText("トラちゃん・キキ・フワ")
    await expect(diary).not.toContainText("美雪の兄・変身役")
    const visibleDiaryBody = await diary.locator(".diary-entry-body").first().innerText()
    expect(visibleDiaryBody.split("。").filter(Boolean)).toHaveLength(4)
    expect(visibleDiaryBody).toContain("なおくん")
    expect(visibleDiaryBody).toContain("うんち")

    await page.goto("/#club")
    await expect(page.getByTestId("club-content")).toBeVisible()
    await expect(page.getByTestId("club-content")).not.toContainText("なおくん")
    await expect(page.getByTestId("club-content")).not.toContainText("分岐ストーリー")
    await expect(page.getByRole("button", { name: /いつもの三匹図鑑/ })).toBeVisible()
    await page.getByRole("button", { name: /いつもの三匹図鑑/ }).click()

    const collection = page.getByTestId("collections-content")
    await expect(collection).toBeVisible()
    await expect(collection).not.toContainText("なおくん")
    await expect(collection).toContainText("トラちゃん")
    await expect(collection).toContainText("キキ")
    await expect(collection).toContainText("フワ")
    for (const legacyName of ["マロン", "ユキ", "ミケ", "クロ", "トラまる"]) {
      await expect(collection).not.toContainText(legacyName)
    }
    const collectionHero = page.getByRole("img", { name: "図鑑を開く美雪と、トラちゃん、キキ、フワ" })
    await expect(collectionHero).toBeVisible()
    await expect(collectionHero.locator('img[src*="cat-book-three-cats.webp"]')).toBeVisible()
    expect(browserErrors).toEqual([])
  })
})

test.describe("追加コンテンツ", () => {
  test("日記を検索・絞り込み・ランダム表示できる", async ({ page }) => {
    await page.goto("/")
    await openPrimaryTab(page, "diary")
    const diary = page.getByTestId("diary-content")
    await expect(diary.getByRole("textbox", { name: "ことばで検索" })).toBeVisible()
    await expect(diary.getByRole("button", { name: /お気に入りのみ/ })).toBeVisible()
    await expect(diary.getByRole("button", { name: /ランダムで読む/ })).toBeVisible()
  })

  test("猫クラブで三匹の活動ファイルを切り替えられる", async ({ page }) => {
    await page.goto("/#club")
    const club = page.getByTestId("club-content")
    await expect(club.getByRole("tab", { name: "しぐさ図鑑" })).toBeVisible()
    await club.getByRole("tab", { name: "三匹のお願い" }).click()
    await expect(club).toContainText("トラちゃん")
    await expect(club).toContainText("キキ")
    await expect(club).toContainText("フワ")
    await club.getByRole("tab", { name: "週間新聞" }).click()
    await expect(club.getByRole("button", { name: "新聞を画像保存" })).toBeVisible()
  })

  test("カフェ閲覧モードに三匹と画像保存がある", async ({ page }) => {
    await page.goto("/#club")
    await page.getByRole("button", { name: /カフェ編集室/ }).click()
    await expect(page.getByRole("region", { name: "猫カフェ・メニュー工房" })).toBeVisible()
    await page.getByRole("button", { name: "猫カフェを見る" }).click()
    await expect(page.getByRole("button", { name: "カフェカードを画像保存" })).toBeVisible()
    await expect(page.getByRole("img", { name: "茶トラのトラちゃん" })).toBeVisible()
    await expect(page.getByRole("img", { name: "黒猫のキキ" })).toBeVisible()
    await expect(page.getByRole("img", { name: "白い長毛猫のフワ" })).toBeVisible()
  })
})

test.describe("スクリーンショット", () => {
  test("ホームタブ", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("home-tab.png", { maxDiffPixelRatio: 0.05 })
  })

  test("ゲームタブ一覧", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-games']").click()
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("games-tab.png", { maxDiffPixelRatio: 0.05 })
  })

  test("ぬりえタブ", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-coloring']").click()
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("coloring-tab.png", { maxDiffPixelRatio: 0.05 })
  })

  test("占いタブ", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-fortune']").click()
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("fortune-tab.png", { maxDiffPixelRatio: 0.05 })
  })

  test("日記タブ", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-diary']").click()
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("diary-tab.png", { maxDiffPixelRatio: 0.05 })
  })
})
