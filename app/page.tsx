import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { PictureDiary } from "@/components/picture-diary"
import { CatGame } from "@/components/cat-game"
import { CatQuiz } from "@/components/cat-quiz"
import { CatBreedQuiz } from "@/components/cat-breed-quiz"
import { ColoringBook } from "@/components/coloring-book"
import { CatFortune } from "@/components/cat-fortune"
import { CatMemoryGame } from "@/components/cat-memory-game"
import { CatSimonGame } from "@/components/cat-simon-game"
import { SectionDivider } from "@/components/section-divider"
import { WelcomeToast } from "@/components/welcome-toast"
import { MiyukiProfile } from "@/components/miyuki-profile"
import { FloatingCatGuide } from "@/components/floating-cat-guide"

export default function MiyukiCatPage() {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <Header />
      <WelcomeToast />
      <FloatingCatGuide />
      <main className="flex flex-col items-center w-full max-w-4xl px-4 py-6 md:py-8 space-y-8 md:space-y-12">
        <Hero />
        <SectionDivider />
        <div className="w-full animate-slide-in-bottom" style={{ animationDelay: "0.2s" }}>
          <MiyukiProfile />
        </div>
        <SectionDivider />
        <div className="w-full animate-slide-in-bottom" style={{ animationDelay: "0.4s" }}>
          <CatGame />
        </div>
        <SectionDivider />
        <div className="w-full animate-slide-in-bottom" style={{ animationDelay: "0.6s" }}>
          <CatQuiz />
        </div>
        <SectionDivider />
        <div className="w-full animate-slide-in-bottom" style={{ animationDelay: "0.8s" }}>
          <CatBreedQuiz />
        </div>
        <SectionDivider />
        <div className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.0s" }}>
          <CatMemoryGame />
        </div>
        <SectionDivider />
        <div className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.1s" }}>
          <CatSimonGame />
        </div>
        <SectionDivider />
        <div className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.2s" }}>
          <ColoringBook />
        </div>
        <SectionDivider />
        <div className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.4s" }}>
          <CatFortune />
        </div>
        <SectionDivider />
        <div className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.6s" }}>
          <PictureDiary />
        </div>
      </main>
      <footer className="w-full py-6 mt-auto text-center text-sm text-[#8A6E59]">
        <p>© 2025 美雪の猫ページ All rights reserved.</p>
      </footer>
    </div>
  )
}
