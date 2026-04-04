"use client"

import { useEffect, useRef, useState } from "react"

type LazySectionProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function LazySection({ children, className, style }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} style={style}>
      {isVisible ? children : <div className="min-h-[28rem]" />}
    </div>
  )
}
