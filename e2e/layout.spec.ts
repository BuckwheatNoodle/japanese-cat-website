import { test, expect } from "@playwright/test"

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

  test("ボトムタブが5つある", async ({ page }) => {
    await page.goto("/")
    const tabButtons = page.locator("[data-testid='bottom-tabs'] button")
    await expect(tabButtons).toHaveCount(5)
  })

  test("ボトムタブが画面下部に固定されている", async ({ page }) => {
    await page.goto("/")
    const tabs = page.locator("[data-testid='bottom-tabs']")
    const box = await tabs.boundingBox()
    const viewport = page.viewportSize()!
    // タブの下端がビューポート下端付近にある
    expect(box!.y + box!.height).toBeGreaterThan(viewport.height - 10)
  })

  test("ホームタブがデフォルトで選択されている", async ({ page }) => {
    await page.goto("/")
    const homeTab = page.locator("[data-testid='tab-home']")
    await expect(homeTab).toHaveAttribute("aria-selected", "true")
  })

  test("ヘッダーが表示される", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("header")).toBeVisible()
  })
})

test.describe("タブ切替テスト", () => {
  test("ゲームタブに切り替えられる", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-games']").click()
    await expect(page.locator("[data-testid='tab-games']")).toHaveAttribute("aria-selected", "true")
    await expect(page.locator("[data-testid='games-content']")).toBeVisible()
  })

  test("ぬりえタブに切り替えられる", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-coloring']").click()
    await expect(page.locator("[data-testid='tab-coloring']")).toHaveAttribute("aria-selected", "true")
  })

  test("占いタブに切り替えられる", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-fortune']").click()
    await expect(page.locator("[data-testid='tab-fortune']")).toHaveAttribute("aria-selected", "true")
  })

  test("日記タブに切り替えられる", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-diary']").click()
    await expect(page.locator("[data-testid='tab-diary']")).toHaveAttribute("aria-selected", "true")
  })

  test("タブ切替でコンテンツが変わる", async ({ page }) => {
    await page.goto("/")
    // ホーム → ゲーム → ホーム
    await expect(page.locator("[data-testid='home-content']")).toBeVisible()
    await page.locator("[data-testid='tab-games']").click()
    await expect(page.locator("[data-testid='home-content']")).not.toBeVisible()
    await expect(page.locator("[data-testid='games-content']")).toBeVisible()
    await page.locator("[data-testid='tab-home']").click()
    await expect(page.locator("[data-testid='home-content']")).toBeVisible()
  })
})

test.describe("ホームタブ", () => {
  test("Heroセクションが表示される", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("text=美雪のページへようこそ")).toBeVisible()
  })

  test("プロフィールが表示される", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("text=わたしの猫愛について")).toBeVisible()
  })
})

test.describe("ゲームタブ", () => {
  test("ゲーム一覧がカードグリッドで表示される", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-games']").click()
    const cards = page.locator("[data-testid='games-content'] [data-testid='game-card']")
    await expect(cards).toHaveCount(5)
  })

  test("ゲームカードをタップすると展開される", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-games']").click()
    await page.locator("[data-testid='game-card']").first().click()
    await expect(page.locator("[data-testid='game-expanded']")).toBeVisible()
  })

  test("展開したゲームから一覧に戻れる", async ({ page }) => {
    await page.goto("/")
    await page.locator("[data-testid='tab-games']").click()
    await page.locator("[data-testid='game-card']").first().click()
    await page.locator("[data-testid='game-back-button']").click()
    await expect(page.locator("[data-testid='game-card']")).toHaveCount(5)
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
