"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/shopify"

type Category = "cream" | "oil" | "serum"

const categories = [
  { value: "cream" as Category, label: "Cream" },
  { value: "oil" as Category, label: "Oil" },
  { value: "serum" as Category, label: "Serum" }
]

export function ProductGrid({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("cream")
  const [isVisible, setIsVisible] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  
  const filteredProducts = products.filter(product => product.category === selectedCategory)

  const handleCategoryChange = (category: Category) => {
    if (category !== selectedCategory) {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedCategory(category)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    }
  }

  // Preload all product images on mount
  useEffect(() => {
    products.forEach((product) => {
      const img = new window.Image()
      img.src = product.image
    })
  }, [])

  // Scrollytelling effect
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      
      const section = sectionRef.current
      const rect = section.getBoundingClientRect()
      const sectionTop = rect.top
      const windowHeight = window.innerHeight
      
      // Only start when section is fully in viewport
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

  useEffect(() => {
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
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

    if (gridRef.current) {
      gridObserver.observe(gridRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (gridRef.current) {
        gridObserver.unobserve(gridRef.current)
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
    }
  }, [])

  // Calculate transform based on scroll progress
  const cardWidth = 320 // Card width
  const gap = 24 // Gap between cards
  const totalWidth = (cardWidth + gap) * filteredProducts.length - gap
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
  const maxScroll = Math.max(0, totalWidth - viewportWidth + 100) // +100 for padding
  const horizontalOffset = scrollProgress * maxScroll
  
  return (
    <section ref={sectionRef} className="py-24 bg-card min-h-[250vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="w-full px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="mb-16 ml-8">
          <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            Our Collection
          </span>
          <h2 className={`font-serif leading-tight text-foreground mb-4 text-balance text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            Gentle essentials
          </h2>
          <p className={`text-lg text-muted-foreground max-w-md ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
            Thoughtfully crafted products for your daily skincare ritual
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex justify-center mb-12">
          
        </div>

        {/* Product Grid - Horizontal */}
        <div 
          ref={gridRef}
          className="flex gap-6 pl-8"
          style={{ transform: `translateX(-${horizontalOffset}px)`, transition: 'transform 0.1s linear' }}
        >
          {filteredProducts.map((product, index) => (
            <Link
              key={`${selectedCategory}-${product.id}`}
              href={`/product/${product.id}`}
              className={`group transition-all duration-500 ease-out flex-shrink-0 ${
                isVisible && !isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ 
                transitionDelay: isTransitioning ? '0ms' : `${index * 80}ms`,
                width: '320px',
                height: '450px'
              }}
            >
              <div className="relative bg-background rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02] h-full w-full">
                {/* Image - Full Height */}
                <div className="relative h-full bg-muted overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover boty-transition group-hover:scale-105"
                  />
                  {/* Badge */}
                  {product.badge && (
                    <span
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-white text-black ${
                        product.badge === "Sale"
                          ? "bg-destructive/10 text-destructive"
                          : product.badge === "New"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                  
                  {/* Info with Progressive Blur */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {/* Progressive blur overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent backdrop-blur-[6px]" style={{ maskImage: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)' }}></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="font-serif text-lg text-white mb-1">{product.name}</h3>
                      <p className="text-sm text-white/80 mb-3">{product.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-white/60 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          
        </div>
        </div>
      </div>
    </section>
  )
}
