import sharp from "sharp"

const [, , input, output, widthValue = "720"] = process.argv

if (!input || !output) {
  console.error("usage: node scripts/extract-light-background.mjs <input> <output> [width]")
  process.exit(1)
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const pixelCount = info.width * info.height
const visited = new Uint8Array(pixelCount)
const queue = new Int32Array(pixelCount)
let head = 0
let tail = 0

const looksLikeLightBackdrop = (pixelIndex) => {
  const offset = pixelIndex * 4
  const red = data[offset]
  const green = data[offset + 1]
  const blue = data[offset + 2]
  return Math.min(red, green, blue) >= 232 && Math.max(red, green, blue) - Math.min(red, green, blue) <= 18
}

const enqueue = (pixelIndex) => {
  if (visited[pixelIndex] || !looksLikeLightBackdrop(pixelIndex)) return
  visited[pixelIndex] = 1
  queue[tail++] = pixelIndex
}

for (let x = 0; x < info.width; x += 1) {
  enqueue(x)
  enqueue((info.height - 1) * info.width + x)
}
for (let y = 0; y < info.height; y += 1) {
  enqueue(y * info.width)
  enqueue(y * info.width + info.width - 1)
}

while (head < tail) {
  const pixelIndex = queue[head++]
  const x = pixelIndex % info.width
  const y = Math.floor(pixelIndex / info.width)
  if (x > 0) enqueue(pixelIndex - 1)
  if (x + 1 < info.width) enqueue(pixelIndex + 1)
  if (y > 0) enqueue(pixelIndex - info.width)
  if (y + 1 < info.height) enqueue(pixelIndex + info.width)
}

for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
  if (visited[pixelIndex]) data[pixelIndex * 4 + 3] = 0
}

const result = await sharp(data, { raw: info })
  .resize({ width: Number(widthValue), withoutEnlargement: true })
  .webp({ quality: 86, alphaQuality: 92, effort: 5 })
  .toFile(output)

console.log(`${output}: ${result.width}x${result.height}, ${result.size} bytes`)
