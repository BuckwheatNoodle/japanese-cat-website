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
  test("ねこカフェの案内と遊ぶボタンが表示される", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "ねこカフェへようこそ" })).toBeAttached()
    await expect(page.getByRole("button", { name: "いっしょに遊ぼう！" })).toBeVisible()
  })

  test("ねこカフェパスポートが表示される", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "ねこカフェパスポート" })).toBeVisible()
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
