"use client"

import { useEffect, useRef, useState } from "react"
import { Heart, Users, TreePine, Package } from "lucide-react"

const stats = [
  {
    icon: TreePine,
    value: "50K+",
    label: "Trees Planted",
    description: "One tree for every order"
  },
  {
    icon: Package,
    value: "100%",
    label: "Plastic-Free",
    description: "Recyclable packaging only"
  },
  {
    icon: Users,
    value: "200+",
    label: "Local Farmers",
    description: "Supporting communities"
  },
  {
    icon: Heart,
    value: "Zero",
    label: "Animal Testing",
    description: "Cruelty-free certified"
  }
]

export function ImpactSection() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [quoteVisible, setQuoteVisible] = useState(false)
  const [imageScale, setImageScale] = useState(1)
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const statsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const quoteObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setQuoteVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    if (statsRef.current) {
      statsObserver.observe(statsRef.current)
    }

    if (quoteRef.current) {
      quoteObserver.observe(quoteRef.current)
    }

    return () => {
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
      if (statsRef.current) {
        statsObserver.unobserve(statsRef.current)
      }
      if (quoteRef.current) {
        quoteObserver.unobserve(quoteRef.current)
      }
    }
  }, [])

  // Scroll-based zoom effect for image
  useEffect(() => {
    const handleScroll = () => {
      if (!quoteRef.current) return

      const rect = quoteRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate how much of the quote block is visible
      const visibleTop = Math.max(0, -rect.top)
      const visibleBottom = Math.min(rect.height, windowHeight - rect.top)
      const visibleHeight = visibleBottom - visibleTop
      const visiblePercent = visibleHeight / windowHeight

      // Scale from 1 to 1.15 based on visibility
      const scale = 1 + (Math.min(1, Math.max(0, visiblePercent)) * 0.15)
      setImageScale(scale)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            Our Impact
          </span>
          <h2 className={`font-serif text-4xl leading-tight text-foreground mb-6 text-balance md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            Beauty with purpose.
          </h2>
          <p className={`text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
            We're committed to making a positive impact on the planet and the people who call it home.
            Every purchase supports sustainable practices and ethical partnerships.
          </p>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`bg-card p-8 rounded-3xl text-center boty-transition hover:scale-105 transition-all duration-700 ease-out ${
                statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <stat.icon className="w-8 h-8 text-primary" strokeWidth={1} />
              </div>
              <div className="font-serif text-4xl text-foreground mb-2">{stat.value}</div>
              <h3 className="font-medium text-foreground mb-2">{stat.label}</h3>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Quote Block */}
        <div 
          ref={quoteRef}
          className={`relative bg-primary/5 rounded-3xl overflow-hidden transition-all duration-700 ease-out ${
            quoteVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Image */}
            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full min-h-[500px] overflow-hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Beaut_%20naturelle%204%201-qmUk4rPG4kfk7D1E9ZwmuXdxvgf8Xq.png"
                alt="Natural beauty"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out"
                style={{ transform: `scale(${imageScale})` }}
              />
            </div>

            {/* Right - Quote */}
            <div className="p-8 lg:p-12 lg:pr-16">
              <div className="text-6xl text-primary mb-6 font-serif">"</div>
              <blockquote className="font-serif text-2xl lg:text-3xl text-foreground leading-relaxed mb-6">
                Skincare shouldn't cost the earth. We believe in creating products that nourish your skin 
                while protecting the planet for future generations.
              </blockquote>
              <footer className="text-muted-foreground">
                <div className="font-medium text-foreground">Marie Chen</div>
                <div className="text-sm">Founder &amp; CEO, Amber</div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
