import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const html = readFileSync(resolve("out/index.html"), "utf8")
const robotsMeta = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)
const googleBotMeta = html.match(/<meta\s+name=["']googlebot["']\s+content=["']([^"']+)["']/i)

function requireDirectives(label, match, directives) {
  if (!match) throw new Error(`${label} meta tag is missing from out/index.html`)

  const content = match[1].toLowerCase()
  for (const directive of directives) {
    if (!content.split(",").map((value) => value.trim()).includes(directive)) {
      throw new Error(`${label} meta tag is missing ${directive}: ${match[0]}`)
    }
  }
}

requireDirectives("robots", robotsMeta, ["noindex", "nofollow", "noarchive", "nosnippet", "noimageindex"])
requireDirectives("googlebot", googleBotMeta, ["noindex", "nofollow", "noarchive", "nosnippet", "noimageindex"])

console.log("Search exclusion verification passed: robots and googlebot prevent indexing, following, caching, snippets, and image indexing.")
