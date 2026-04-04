import Image from "next/image"
import { assetPath } from "@/lib/utils"

export function Hero() {
  return (
    <section className="w-full flex flex-col md:flex-row items-center justify-center text-center md:text-left p-6 bg-[#FDEEDC]/80 rounded-2xl shadow-lg border-2 border-dashed border-white/80 animate-slide-in-bottom">
      <div className="md:mr-8 mb-4 md:mb-0 flex-shrink-0">
        <Image
          src={assetPath("/miyuki-character.png")}
          alt="このページの制作者、美雪のイラスト"
          width={200}
          height={200}
          className="transition-transform hover:scale-105"
          priority
        />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-[#8A6E59]">美雪のページへようこそ！</h2>
        <p className="text-base md:text-lg text-[#5C3A21]">
          わたしが作った、大好きな猫のページだよ。
          <br />
          ゲームやクイズで、たくさん遊んでいってね！
        </p>
      </div>
    </section>
  )
}
