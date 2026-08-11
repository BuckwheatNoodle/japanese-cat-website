import { createReadStream } from "node:fs"
import { realpath, stat } from "node:fs/promises"
import { createServer } from "node:http"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, "..")

const MIME_TYPES = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".m4a", "audio/mp4"],
  [".map", "application/json; charset=utf-8"],
  [".mp3", "audio/mpeg"],
  [".mp4", "video/mp4"],
  [".ogg", "audio/ogg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".wav", "audio/wav"],
  [".webm", "video/webm"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
])

function argumentValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function normalizeBasePath(value) {
  if (!value || value === "/") return ""
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`
  const normalized = withLeadingSlash.replace(/\/$/, "")
  if (
    normalized.includes("\\")
    || normalized.includes("\0")
    || normalized.includes("?")
    || normalized.includes("#")
    || normalized.split("/").some((segment) => segment === "..")
  ) {
    throw new Error(`Invalid base path: ${value}`)
  }
  return normalized
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate)
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
}

function sendText(response, statusCode, message) {
  const body = Buffer.from(message, "utf8")
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": body.length,
    "X-Content-Type-Options": "nosniff",
  })
  response.end(body)
}

function parseRequestPath(requestUrl) {
  const rawTarget = requestUrl || "/"
  if (!rawTarget.startsWith("/")) throw new Error("invalid-request-target")
  const rawPath = rawTarget.split(/[?#]/, 1)[0]
  let decodedRawPath
  try {
    decodedRawPath = decodeURIComponent(rawPath)
  } catch {
    throw new Error("malformed-path-encoding")
  }
  if (
    decodedRawPath.includes("\0")
    || decodedRawPath.includes("\\")
    || decodedRawPath.split("/").some((segment) => segment === "..")
  ) {
    throw new Error("unsafe-path")
  }

  const url = new URL(rawTarget, "http://static-preview.local")
  try {
    return decodeURIComponent(url.pathname)
  } catch {
    throw new Error("malformed-path-encoding")
  }
}

function candidatePaths(relativePath) {
  const cleanPath = relativePath.replace(/^\/+/, "")
  if (!cleanPath) return ["index.html"]
  if (relativePath.endsWith("/")) return [`${cleanPath}index.html`]
  if (path.posix.extname(cleanPath)) return [cleanPath]
  return [cleanPath, `${cleanPath}.html`, `${cleanPath}/index.html`, "index.html"]
}

async function resolvePublicFile(realRoot, relativePath) {
  for (const candidatePath of candidatePaths(relativePath)) {
    const absolutePath = path.resolve(realRoot, ...candidatePath.split("/"))
    if (!isWithin(realRoot, absolutePath)) throw new Error("unsafe-path")

    try {
      const metadata = await stat(absolutePath)
      const filePath = metadata.isDirectory() ? path.join(absolutePath, "index.html") : absolutePath
      const fileMetadata = metadata.isDirectory() ? await stat(filePath) : metadata
      if (!fileMetadata.isFile()) continue
      const resolvedPath = await realpath(filePath)
      if (!isWithin(realRoot, resolvedPath)) throw new Error("unsafe-path")
      return { filePath: resolvedPath, metadata: fileMetadata }
    } catch (error) {
      if (error instanceof Error && error.message === "unsafe-path") throw error
      const code = error && typeof error === "object" && "code" in error ? error.code : undefined
      if (code !== "ENOENT" && code !== "ENOTDIR") throw error
    }
  }
  return null
}

function parseByteRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim())
  if (!match || (!match[1] && !match[2])) return null

  let start
  let end
  if (!match[1]) {
    const suffixLength = Number(match[2])
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null
    start = Math.max(0, size - suffixLength)
    end = size - 1
  } else {
    start = Number(match[1])
    end = match[2] ? Number(match[2]) : size - 1
  }

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) return null
  return { start, end: Math.min(end, size - 1) }
}

function streamFile(request, response, file, statusCode, basePath) {
  const extension = path.extname(file.filePath).toLowerCase()
  const headers = {
    "Accept-Ranges": "bytes",
    "Content-Type": MIME_TYPES.get(extension) || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  }

  const publicScope = `${basePath || ""}/`
  if (path.basename(file.filePath) === "sw.js") headers["Service-Worker-Allowed"] = publicScope
  if (file.filePath.includes(`${path.sep}_next${path.sep}static${path.sep}`)) {
    headers["Cache-Control"] = "public, max-age=31536000, immutable"
  } else if ([".html", ".webmanifest"].includes(extension) || path.basename(file.filePath) === "sw.js") {
    headers["Cache-Control"] = "no-cache"
  }

  const rangeHeader = request.headers.range
  if (rangeHeader) {
    const range = parseByteRange(rangeHeader, file.metadata.size)
    if (!range) {
      response.writeHead(416, { ...headers, "Content-Range": `bytes */${file.metadata.size}` })
      response.end()
      return
    }
    headers["Content-Range"] = `bytes ${range.start}-${range.end}/${file.metadata.size}`
    headers["Content-Length"] = String(range.end - range.start + 1)
    response.writeHead(206, headers)
    if (request.method === "HEAD") {
      response.end()
      return
    }
    const stream = createReadStream(file.filePath, { start: range.start, end: range.end })
    stream.on("error", (error) => response.destroy(error))
    stream.pipe(response)
    return
  }

  headers["Content-Length"] = String(file.metadata.size)
  response.writeHead(statusCode, headers)
  if (request.method === "HEAD") {
    response.end()
    return
  }
  const stream = createReadStream(file.filePath)
  stream.on("error", (error) => response.destroy(error))
  stream.pipe(response)
}

export async function createStaticExportServer({ outDirectory, basePath = "" }) {
  const normalizedBasePath = normalizeBasePath(basePath)
  const requestedRoot = path.resolve(outDirectory)
  let realRoot
  try {
    realRoot = await realpath(requestedRoot)
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : undefined
    if (code === "ENOENT") throw new Error(`Static export directory was not found at ${requestedRoot}. Run "npm run build" first.`)
    throw error
  }
  const indexFile = await resolvePublicFile(realRoot, "/")
  if (!indexFile) throw new Error(`Static export index.html was not found in ${realRoot}. Run "npm run build" first.`)

  return createServer((request, response) => {
    void (async () => {
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.setHeader("Allow", "GET, HEAD")
        sendText(response, 405, "Method not allowed")
        return
      }

      let requestPath
      try {
        requestPath = parseRequestPath(request.url)
      } catch {
        sendText(response, 400, "Invalid request path")
        return
      }

      if (normalizedBasePath) {
        if (requestPath === "/" || requestPath === normalizedBasePath) {
          response.writeHead(308, { Location: `${normalizedBasePath}/` })
          response.end()
          return
        }
        if (!requestPath.startsWith(`${normalizedBasePath}/`)) {
          sendText(response, 404, "Not found")
          return
        }
        requestPath = requestPath.slice(normalizedBasePath.length)
      }

      let file
      try {
        file = await resolvePublicFile(realRoot, requestPath)
      } catch (error) {
        if (error instanceof Error && error.message === "unsafe-path") {
          sendText(response, 400, "Invalid request path")
          return
        }
        throw error
      }
      if (file) {
        streamFile(request, response, file, 200, normalizedBasePath)
        return
      }

      const notFound = await resolvePublicFile(realRoot, "/404.html")
      if (notFound) streamFile(request, response, notFound, 404, normalizedBasePath)
      else sendText(response, 404, "Not found")
    })().catch((error) => {
      console.error("Static preview request failed:", error)
      if (!response.headersSent) sendText(response, 500, "Internal server error")
      else response.destroy()
    })
  })
}

async function main() {
  const outDirectory = path.resolve(projectRoot, argumentValue("--out-dir") || "out")
  const basePath = normalizeBasePath(argumentValue("--base-path") ?? process.env.NEXT_PUBLIC_BASE_PATH)
  const host = argumentValue("--host") || process.env.HOST || "127.0.0.1"
  const portValue = argumentValue("--port") || process.env.PORT || "3000"
  const port = Number(portValue)
  if (!Number.isSafeInteger(port) || port < 0 || port > 65_535) throw new Error(`Invalid port: ${portValue}`)

  const server = await createStaticExportServer({ outDirectory, basePath })
  server.listen(port, host, () => {
    const address = server.address()
    const actualPort = typeof address === "object" && address ? address.port : port
    console.log(`Static export preview: http://${host}:${actualPort}${basePath || "/"}`)
  })

  const close = () => server.close(() => process.exit(0))
  process.once("SIGINT", close)
  process.once("SIGTERM", close)
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirectRun) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
