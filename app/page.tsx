import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SectionDivider } from "@/components/section-divider"
import { WelcomeToast } from "@/components/welcome-toast"
import { MiyukiProfile } from "@/components/miyuki-profile"
import { FloatingCatGuide } from "@/components/floating-cat-guide"
import { LazySection } from "@/components/lazy-section"

const CatGame = dynamic(() => import("@/components/cat-game").then((m) => m.CatGame))
const CatQuiz = dynamic(() => import("@/components/cat-quiz").then((m) => m.CatQuiz))
const CatBreedQuiz = dynamic(() => import("@/components/cat-breed-quiz").then((m) => m.CatBreedQuiz))
const CatMemoryGame = dynamic(() => import("@/components/cat-memory-game").then((m) => m.CatMemoryGame))
const CatSimonGame = dynamic(() => import("@/components/cat-simon-game").then((m) => m.CatSimonGame))
const ColoringBook = dynamic(() => import("@/components/coloring-book").then((m) => m.ColoringBook))
const CatFortune = dynamic(() => import("@/components/cat-fortune").then((m) => m.CatFortune))
const PictureDiary = dynamic(() => import("@/components/picture-diary").then((m) => m.PictureDiary))

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
        <LazySection className="w-full animate-slide-in-bottom" style={{ animationDelay: "0.4s" }}>
          <CatGame />
        </LazySection>
        <SectionDivider />
        <LazySection className="w-full animate-slide-in-bottom" style={{ animationDelay: "0.6s" }}>
          <CatQuiz />
        </LazySection>
        <SectionDivider />
        <LazySection className="w-full animate-slide-in-bottom" style={{ animationDelay: "0.8s" }}>
          <CatBreedQuiz />
        </LazySection>
        <SectionDivider />
        <LazySection className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.0s" }}>
          <CatMemoryGame />
        </LazySection>
        <SectionDivider />
        <LazySection className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.1s" }}>
          <CatSimonGame />
        </LazySection>
        <SectionDivider />
        <LazySection className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.2s" }}>
          <ColoringBook />
        </LazySection>
        <SectionDivider />
        <LazySection className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.4s" }}>
          <CatFortune />
        </LazySection>
        <SectionDivider />
        <LazySection className="w-full animate-slide-in-bottom" style={{ animationDelay: "1.6s" }}>
          <PictureDiary />
        </LazySection>
      </main>
      <footer className="w-full py-6 mt-auto text-center text-sm text-[#8A6E59]">
        <p>© 2025 美雪の猫ページ All rights reserved.</p>
      </footer>
    </div>
  )
}
