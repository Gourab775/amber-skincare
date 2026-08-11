"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Recycle, Leaf, Flower2, Globe } from "lucide-react"

const features = [
  {
    icon: Recycle,
    title: "Eco-Friendly Packaging",
    description: "Recyclable and biodegradable materials"
  },
  {
    icon: Leaf,
    title: "100% Natural",
    description: "No synthetic chemicals or parabens"
  },
  {
    icon: Flower2,
    title: "Plant-Based",
    description: "Botanical extracts and essential oils"
  },
  {
    icon: Globe,
    title: "Ethical Sourcing",
    description: "Fair trade certified ingredients"
  }
]

export function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isVideoVisible, setIsVideoVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const bentoRef = useRef<HTMLDivElement>(null)
  const videoSectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const videoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVideoVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bentoRef.current) {
      observer.observe(bentoRef.current)
    }

    if (videoSectionRef.current) {
      videoObserver.observe(videoSectionRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (bentoRef.current) {
        observer.unobserve(bentoRef.current)
      }
      if (videoSectionRef.current) {
        videoObserver.unobserve(videoSectionRef.current)
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Bento Grid */}
        <div 
          ref={bentoRef}
          className="grid md:grid-cols-4 mb-20 md:grid-rows-[300px_300px] gap-6"
        >
          {/* Left Large Block - Rainbow Makeup */}
          <div 
            className={`relative rounded-3xl overflow-hidden h-[500px] md:h-auto md:col-span-2 md:row-span-2 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.85]'
            }`}
            style={{ transitionDelay: '0ms' }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/77d79b00-3159-48ef-8fe2-f4ccd5f2c4ad-dG4wgqeIy1Y4s0rQky5ke3xJWCPIMc.png"
              alt="Vibrant beauty"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-white p-6 shadow-lg rounded-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  
                </div>
                <div>
                  <h3 className="text-xl text-foreground mb-2 font-medium">
                    Express Your <span className="">True Colors</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Bold, vibrant, and unapologetically you. Our formulas are made to shine.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Right - Blue Makeup */}
          <div 
            className={`rounded-3xl p-6 md:p-8 flex flex-col justify-center md:col-span-2 relative overflow-hidden transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.85]'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/69706cf5-c60f-438a-86c6-6f773fef1019-cYgcoUn6dDvp0y5am3AHsKMfUeymFo.png"
              alt="Ocean beauty"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            
          </div>

          {/* Bottom Right - Warm Sunset */}
          <div 
            className={`rounded-3xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden md:col-span-2 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.85]'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7b8a7abd-4e31-48ad-9bc9-9db8f9dfbae9-iqN4fCYJvstAT3rwirwOu5JcXcq6xE.png"
              alt="Radiant glow"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay Card */}
            
          </div>
        </div>

        {/* Header Section */}
        <div 
          ref={headerRef}
          className="text-center mb-16"
        >
          <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            Why Boty
          </span>
          <h2 className={`font-serif text-4xl leading-tight text-foreground mb-6 text-balance md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            Care that breathes.
          </h2>
          <p className={`text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
            We believe skincare should be a gentle ritual, not a complicated routine. 
            Every product is crafted with intention and love for your skin.
          </p>
        </div>

        {/* Two Videos Side by Side */}
        <div 
          ref={videoSectionRef}
          className="grid lg:grid-cols-2 gap-6 mb-6"
        >
          {/* Video 1 */}
          <div 
            className={`relative aspect-[4/5] rounded-3xl overflow-hidden boty-shadow transition-all duration-700 ease-out ${
              isVideoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.85]'
            }`}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0c826034-d4f2-4d4f-8e99-50e94e4ce63f-dG1CBOjR36xFPTbhcROrHbomGXtlTQ.mp4" type="video/mp4" />
            </video>
            {/* Person Info with Progressive Blur */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="absolute inset-0 backdrop-blur-[8px] bg-black/30" style={{ maskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)' }} />
              <div className="relative z-10">
                <h3 className="font-serif text-3xl text-white mb-1">Emma Laurent</h3>
                <p className="text-white/70 text-sm mb-3">28 years old</p>
                <p className="text-white/90 text-sm font-medium mb-1">Hydra Serum &middot; Daily Moisturizer</p>
                <p className="text-white/70 text-sm leading-relaxed">Morning cleanse, serum, and SPF — simplicity is the key to glowing skin.</p>
              </div>
            </div>
          </div>

          {/* Video 2 */}
          <div 
            className={`relative aspect-[4/5] rounded-3xl overflow-hidden boty-shadow transition-all duration-700 ease-out ${
              isVideoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.85]'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Video%20of%20Noisette%20cr_me%201-h4S1T9tLHMOyCzCkADbHqeevqP2L8K.mp4"
            />
            {/* Person Info with Progressive Blur */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="absolute inset-0 backdrop-blur-[8px] bg-black/30" style={{ maskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, black 40%, transparent 100%)' }} />
              <div className="relative z-10">
                <h3 className="font-serif text-3xl text-white mb-1">Sofia Chen</h3>
                <p className="text-white/70 text-sm mb-3">34 years old</p>
                <p className="text-white/90 text-sm font-medium mb-1">Repair Cream &middot; Night Oil</p>
                <p className="text-white/70 text-sm leading-relaxed">Double cleanse at night, rich balm, and letting my skin breathe while I sleep.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Below Videos */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group p-5 boty-transition hover:scale-[1.02] rounded-md bg-white transition-all duration-700 ease-out ${
                isVideoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 group-hover:bg-primary/20 boty-transition bg-stone-50">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
