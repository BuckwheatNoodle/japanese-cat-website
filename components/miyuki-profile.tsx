import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"

export function MiyukiProfile() {
  return (
    <section className="w-full">
      <Card className="bg-white/80 border-2 border-dashed border-[#EAD8C0]/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <CardHeader className="bg-[#FDEEDC]/60 rounded-t-lg">
          <CardTitle className="flex items-center justify-center text-xl md:text-2xl space-x-2">
            <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
            <span>わたしの猫愛について</span>
            <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex-shrink-0">
              <Image
                src="/miyuki-hugging-cat.png"
                alt="猫を抱っこする美雪"
                width={180}
                height={180}
                className="rounded-full border-4 border-white shadow-md transition-transform hover:rotate-3"
              />
            </div>
            <div className="space-y-3 text-base text-[#5C3A21] text-center md:text-left">
              <p>
                こんにちは、美雪です！
                <br />
                物心ついたときから、スマホゲームはすべて猫に関係あるものになってしまいました。
              </p>
              <p>
                ふわふわの毛、気まぐれな性格、ゴロゴロいう音…
                <br className="sm:hidden" />
                猫のすべてが大好き！
              </p>
              <p>
                このページは、わたしの猫への愛をいっぱい詰め込んだ宝箱。
                <br />
                みんなにも、猫の魅力が少しでも伝わったら嬉しいな。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
