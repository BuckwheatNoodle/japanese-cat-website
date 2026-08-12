export function downloadTextCard(filename: string, title: string, lines: readonly string[]) {
  const canvas = document.createElement("canvas")
  canvas.width = 1080
  canvas.height = 1080
  const context = canvas.getContext("2d")
  if (!context) return false

  context.fillStyle = "#fff8e9"
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = "#b8d8bf"
  context.fillRect(45, 45, 990, 990)
  context.fillStyle = "#fffdf7"
  context.fillRect(70, 70, 940, 940)
  context.fillStyle = "#5c3a21"
  context.font = "bold 54px sans-serif"
  context.fillText(title, 115, 165)
  context.strokeStyle = "#e98b7b"
  context.lineWidth = 5
  context.beginPath()
  context.moveTo(115, 205)
  context.lineTo(965, 205)
  context.stroke()
  context.font = "bold 32px sans-serif"
  let y = 285
  for (const line of lines) {
    for (const wrapped of wrapText(context, line, 800)) {
      context.fillText(wrapped, 130, y)
      y += 58
    }
    y += 14
  }
  context.font = "26px sans-serif"
  context.fillStyle = "#8a6e59"
  context.fillText("美雪の猫ページ", 130, 950)
  const anchor = document.createElement("a")
  anchor.download = filename
  anchor.href = canvas.toDataURL("image/png")
  anchor.click()
  return true
}

function wrapText(context: CanvasRenderingContext2D, value: string, maxWidth: number) {
  const output: string[] = []
  let current = ""
  for (const character of value) {
    if (context.measureText(current + character).width > maxWidth && current) {
      output.push(current)
      current = character
    } else current += character
  }
  if (current) output.push(current)
  return output
}
