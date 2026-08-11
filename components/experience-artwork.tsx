"use client"

import { useEffect, useState } from "react"
import { ImageOff, PawPrint } from "lucide-react"
import { assetPath } from "@/lib/utils"
import styles from "@/components/experience.module.css"

type ExperienceArtworkProps = {
  src: string
  alt: string
  className?: string
  fit?: "cover" | "contain"
  eager?: boolean
}

export function ExperienceArtwork({
  src,
  alt,
  className,
  fit = "contain",
  eager = false,
}: ExperienceArtworkProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <span
      className={[styles.artwork, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={alt}
      data-fit={fit}
      data-failed={failed || undefined}
    >
      {!failed && (
        <img
          src={assetPath(src)}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <span className={styles.artworkFallback} aria-hidden="true">
          <PawPrint />
          <ImageOff />
        </span>
      )}
    </span>
  )
}
