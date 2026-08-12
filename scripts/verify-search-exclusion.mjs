import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const outputDirectory = resolve("out")

function requireDirectives(label, matches, directives) {
  if (matches.length === 0) throw new Error(`${label} meta tag is missing`)
  const valid = matches.some((match) => {
    const content = match[1].toLowerCase().split(",").map((value) => value.trim())
    return directives.every((directive) => content.includes(directive))
  })
  if (!valid) throw new Error(`${label} meta tag does not contain all required directives`)
}

for (const relativePath of ["index.html", "404.html", "offline.html"]) {
  const filePath = resolve(outputDirectory, relativePath)
  if (!existsSync(filePath)) throw new Error(`${relativePath} is missing from the static export`)
  const html = readFileSync(filePath, "utf8")
  const robotsMeta = [...html.matchAll(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/gi)]
  requireDirectives(`${relativePath} robots`, robotsMeta, ["noindex", "nofollow", "noarchive", "nosnippet", "noimageindex"])
  if (relativePath !== "offline.html") {
    const googleBotMeta = [...html.matchAll(/<meta\s+name=["']googlebot["']\s+content=["']([^"']+)["']/gi)]
    requireDirectives(`${relativePath} googlebot`, googleBotMeta, ["noindex", "nofollow", "noarchive", "nosnippet", "noimageindex"])
  }
}

const robotsText = readFileSync(resolve(outputDirectory, "robots.txt"), "utf8")
if (!/^User-agent:\s*\*$/im.test(robotsText) || !/^Disallow:\s*\/$/im.test(robotsText)) {
  throw new Error("out/robots.txt must block all crawlers with User-agent: * and Disallow: /")
}

console.log("Search exclusion verification passed for index, 404, offline, and robots.txt.")
