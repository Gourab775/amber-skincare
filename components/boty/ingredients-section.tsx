"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Droplets, Sparkles, Sun, Wind } from "lucide-react"

const ingredients = [
  {
    icon: Droplets,
    name: "Hyaluronic Acid",
    benefit: "Deep hydration",
    description: "Naturally derived moisture magnet that holds up to 1000x its weight in water"
  },
  {
    icon: Sparkles,
    name: "Vitamin C",
    benefit: "Brightening power",
    description: "Plant-based antioxidant that evens tone and boosts radiance"
  },
  {
    icon: Sun,
    name: "Rosehip Oil",
    benefit: "Skin renewal",
    description: "Cold-pressed botanical rich in essential fatty acids and vitamins"
  },
  {
    icon: Wind,
    name: "Aloe Vera",
    benefit: "Soothing comfort",
    description: "Pure gel from organic plants that calms and repairs"
  },
  {
    icon: Sparkles,
    name: "Niacinamide",
    benefit: "Pore refining",
    description: "Vitamin B3 that minimizes pores and improves skin texture naturally"
  },
  {
    icon: Droplets,
    name: "Squalane",
    benefit: "Moisture lock",
    description: "Plant-derived emollient that mimics skin's natural oils perfectly"
  }
]

export function IngredientsSection() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const section = sectionRef.current
      const rect = section.getBoundingClientRect()
      const sectionTop = rect.top
      const windowHeight = window.innerHeight

      // Only start when section is in viewport
      if (sectionTop > 0) {
        setScrollProgress(0)
        return
      }

      // Calculate progress based on how far section has scrolled
      const scrollDistance = Math.abs(sectionTop)
      const maxScrollDistance = rect.height - windowHeight
      const progress = scrollDistance / maxScrollDistance

      // Clamp between 0 and 1
      const clampedProgress = Math.max(0, Math.min(1, progress))
      setScrollProgress(clampedProgress)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate blur based on scroll progress (starts at 20px, ends at 0px)
  const blurAmount = Math.max(0, 20 - (scrollProgress || 0) * 20)
  const opacity = Math.min(1, (scrollProgress || 0) + 0.3)

  return (
    <section ref={sectionRef} className="relative w-full min-h-[200vh]">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Full Viewport Image */}
        <div className="absolute inset-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capture%20d%E2%80%99e%CC%81cran%202026-02-18%20a%CC%80%2022.07.09-q9kO0WFDqpgiOD65jiBVuV81LcYmh4.jpg"
            alt="Natural ingredients"
            fill
            className="object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Centered Text Overlay with Scroll-Based Blur */}
        <div className="absolute inset-0 flex items-center justify-center px-6 lg:px-8">
          <div 
            className="text-center max-w-4xl transition-all duration-100 ease-linear"
            style={{
              filter: `blur(${blurAmount}px)`,
              opacity: opacity
            }}
          >
            <span className="text-sm tracking-[0.3em] uppercase text-white/90 mb-4 block">
              Pure Ingredients
            </span>
            <h2 className="font-serif text-5xl leading-tight text-white mb-6 text-balance md:text-8xl">
              Nature's finest,
              <br />
              for your skin.
            </h2>
            <p className="text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
              Every ingredient is carefully selected from sustainable sources around the world. 
              We only use what your skin truly needs — nothing more, nothing less.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
