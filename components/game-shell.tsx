import type React from "react"
import { Sparkles } from "lucide-react"

type GameShellProps = {
  title: string
  subtitle: string
  icon: React.ElementType
  tone: "coral" | "mint" | "butter" | "lavender" | "blush"
  children: React.ReactNode
}

export function GameShell({ title, subtitle, icon: Icon, tone, children }: GameShellProps) {
  return (
    <section className="game-panel" data-tone={tone} aria-labelledby={`game-${title}`}>
      <header className="game-panel-header">
        <span className="game-panel-icon" aria-hidden="true"><Icon /></span>
        <div>
          <p><Sparkles aria-hidden="true" /> CAT CAFE MINI GAME</p>
          <h2 id={`game-${title}`}>{title}</h2>
          <span>{subtitle}</span>
        </div>
      </header>
      <div className="game-panel-body">{children}</div>
    </section>
  )
}

export function GameStat({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ElementType }) {
  return (
    <div className="game-stat">
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function GamePrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="game-primary-button" {...props}>{children}</button>
}
