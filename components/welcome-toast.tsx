"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Cat } from "lucide-react"
import { ToastAction } from "@/components/ui/toast"

export function WelcomeToast() {
  const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "美雪からのメッセージ♪",
        description: "美雪の猫ページを開いてくれてありがとう！私の猫愛は止まりません♪",
        action: (
          <ToastAction altText="Cat icon" asChild>
            <div className="p-2">
              <Cat className="h-8 w-8 text-[#D4A57A]" />
            </div>
          </ToastAction>
        ),
        duration: 8000,
      })
    }, 1000) // ページ読み込み1秒後に表示

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 空の依存配列でマウント時に一度だけ実行

  return null // このコンポーネント自体は何も描画しない
}
