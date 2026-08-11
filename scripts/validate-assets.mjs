import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

const SOURCE_ROOTS = ["app", "components", "lib"]
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".mjs"])
const ASSET_PATTERN = /["'`](\/[A-Za-z0-9@._~!$&()+,;=\-/]+\.(?:avif|gif|ico|jpe?g|mp3|ogg|png|svg|wav|webm|webp))["'`]/gi
const GENERATED_PATHS = new Set(["/manifest.webmanifest"])
// These paths are accepted only as migration inputs and intentionally have no public file.
const LEGACY_MIGRATION_PATHS = new Set(["/cute-tabby-sitting.png"])

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(absolute))
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(absolute)
  }
  return files
}

const sourceFiles = (await Promise.all(SOURCE_ROOTS.map(walk))).flat()
const references = new Map()

for (const file of sourceFiles) {
  const source = await readFile(file, "utf8")
  for (const match of source.matchAll(ASSET_PATTERN)) {
    const asset = match[1]
    const owners = references.get(asset) ?? []
    owners.push(path.relative(process.cwd(), file))
    references.set(asset, owners)
  }
}

const missing = []
const empty = []
for (const [asset, owners] of references) {
  if (GENERATED_PATHS.has(asset) || LEGACY_MIGRATION_PATHS.has(asset)) continue
  const physical = path.join(process.cwd(), "public", asset.slice(1))
  try {
    const info = await stat(physical)
    if (!info.isFile()) missing.push({ asset, owners })
    else if (info.size === 0) empty.push({ asset, owners })
  } catch {
    missing.push({ asset, owners })
  }
}

if (missing.length || empty.length) {
  for (const item of missing) console.error(`Missing asset: ${item.asset} (${item.owners.join(", ")})`)
  for (const item of empty) console.error(`Empty asset: ${item.asset} (${item.owners.join(", ")})`)
  process.exitCode = 1
} else {
  console.log(`Asset check passed: ${references.size} unique local references across ${sourceFiles.length} source files.`)
}
