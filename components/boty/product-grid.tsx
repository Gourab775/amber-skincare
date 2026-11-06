"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Product } from "@/lib/shopify"

type Category = "cream" | "oil" | "serum"

const categories = [
  { value: "cream" as Category, label: "Cream" },
  { value: "oil" as Category, label: "Oil" },
  { value: "serum" as Category, label: "Serum" }
]

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "hydra-barrier-cream",
    shopifyId: "prod_hydra_barrier_cream",
    variantId: "var_hydra_barrier_cream",
    name: "Hydra Barrier Cream",
    description: "Deeply nourishing moisture cream with ceramides and shea butter.",
    descriptionHtml: "<p>Deeply nourishing moisture cream with ceramides and shea butter.</p>",
    price: 48,
    originalPrice: 62,
    currencyCode: "USD",
    image: "/images/products/cream-jars-colored.png",
    images: ["/images/products/cream-jars-colored.png", "/images/products/jars-wooden-lid.png"],
    badge: "Bestseller",
    category: "cream",
    productType: "Cream",
    availableForSale: true,
  },
  {
    id: "nourishing-night-cream",
    shopifyId: "prod_nourishing_night_cream",
    variantId: "var_nourishing_night_cream",
    name: "Nourishing Night Cream",
    description: "Overnight restorative treatment to firm and replenish tired skin.",
    descriptionHtml: "<p>Overnight restorative treatment to firm and replenish tired skin.</p>",
    price: 54,
    originalPrice: null,
    currencyCode: "USD",
    image: "/images/products/jars-wooden-lid.png",
    images: ["/images/products/jars-wooden-lid.png", "/images/products/moisturizer.jpg"],
    badge: "New",
    category: "cream",
    productType: "Cream",
    availableForSale: true,
  },
  {
    id: "soothing-daily-moisturizer",
    shopifyId: "prod_soothing_daily_moisturizer",
    variantId: "var_soothing_daily_moisturizer",
    name: "Soothing Daily Moisturizer",
    description: "Lightweight daytime hydration with botanical extracts and squalane.",
    descriptionHtml: "<p>Lightweight daytime hydration with botanical extracts and squalane.</p>",
    price: 42,
    originalPrice: 50,
    currencyCode: "USD",
    image: "/images/products/moisturizer.jpg",
    images: ["/images/products/moisturizer.jpg"],
    badge: "Sale",
    category: "cream",
    productType: "Cream",
    availableForSale: true,
  },
  {
    id: "botanical-velvet-cream",
    shopifyId: "prod_botanical_velvet_cream",
    variantId: "var_botanical_velvet_cream",
    name: "Botanical Velvet Cream",
    description: "Velvety skin-repair cream infused with organic aloe vera and calendula.",
    descriptionHtml: "<p>Velvety skin-repair cream infused with organic aloe vera and calendula.</p>",
    price: 46,
    originalPrice: null,
    currencyCode: "USD",
    image: "/images/products/pump-bottles-cream.png",
    images: ["/images/products/pump-bottles-cream.png"],
    badge: null,
    category: "cream",
    productType: "Cream",
    availableForSale: true,
  },
  {
    id: "amber-renewal-oil",
    shopifyId: "prod_amber_renewal_oil",
    variantId: "var_amber_renewal_oil",
    name: "Renewal Face Oil",
    description: "Luxurious cold-pressed oil blend rich in antioxidants and omegas.",
    descriptionHtml: "<p>Luxurious cold-pressed oil blend rich in antioxidants and omegas.</p>",
    price: 58,
    originalPrice: null,
    currencyCode: "USD",
    image: "/images/products/amber-dropper-bottles.png",
    images: ["/images/products/amber-dropper-bottles.png", "/images/products/oil.jpg"],
    badge: "Bestseller",
    category: "oil",
    productType: "Oil",
    availableForSale: true,
  },
  {
    id: "pure-botanical-facial-oil",
    shopifyId: "prod_pure_botanical_facial_oil",
    variantId: "var_pure_botanical_facial_oil",
    name: "Pure Botanical Facial Oil",
    description: "Restores natural lipid barrier with cold-pressed rosehip and jojoba.",
    descriptionHtml: "<p>Restores natural lipid barrier with cold-pressed rosehip and jojoba.</p>",
    price: 52,
    originalPrice: 65,
    currencyCode: "USD",
    image: "/images/products/oil.jpg",
    images: ["/images/products/oil.jpg"],
    badge: "Sale",
    category: "oil",
    productType: "Oil",
    availableForSale: true,
  },
  {
    id: "golden-glow-nectar-oil",
    shopifyId: "prod_golden_glow_nectar_oil",
    variantId: "var_golden_glow_nectar_oil",
    name: "Golden Glow Nectar Oil",
    description: "Infused with sea buckthorn and neroli to illuminate and lock in hydration.",
    descriptionHtml: "<p>Infused with sea buckthorn and neroli to illuminate and lock in hydration.</p>",
    price: 64,
    originalPrice: null,
    currencyCode: "USD",
    image: "/images/products/0ed61900-dd29-4dd2-bc2d-abc2db54c352.png",
    images: ["/images/products/0ed61900-dd29-4dd2-bc2d-abc2db54c352.png"],
    badge: "New",
    category: "oil",
    productType: "Oil",
    availableForSale: true,
  },
  {
    id: "radiance-vitamin-c-serum",
    shopifyId: "prod_radiance_vitamin_c_serum",
    variantId: "var_radiance_vitamin_c_serum",
    name: "Radiance Serum",
    description: "Potent botanical vitamin C serum that reveals a bright, even complexion.",
    descriptionHtml: "<p>Potent botanical vitamin C serum that reveals a bright, even complexion.</p>",
    price: 62,
    originalPrice: 75,
    currencyCode: "USD",
    image: "/images/products/serum.jpg",
    images: ["/images/products/serum.jpg", "/images/products/serum-bottles-1.png"],
    badge: "Bestseller",
    category: "serum",
    productType: "Serum",
    availableForSale: true,
  },
  {
    id: "hydra-hyaluronic-serum",
    shopifyId: "prod_hydra_hyaluronic_serum",
    variantId: "var_hydra_hyaluronic_serum",
    name: "Hydra Serum",
    description: "Multi-molecular hyaluronic acid delivers deep moisture for plump skin.",
    descriptionHtml: "<p>Multi-molecular hyaluronic acid delivers deep moisture for plump skin.</p>",
    price: 56,
    originalPrice: null,
    currencyCode: "USD",
    image: "/images/products/serum-bottles-1.png",
    images: ["/images/products/serum-bottles-1.png"],
    badge: "New",
    category: "serum",
    productType: "Serum",
    availableForSale: true,
  },
  {
    id: "youth-renewal-eye-serum",
    shopifyId: "prod_youth_renewal_eye_serum",
    variantId: "var_youth_renewal_eye_serum",
    name: "Renewal Eye Serum",
    description: "Targeted soothing formula to diminish puffiness and fine lines.",
    descriptionHtml: "<p>Targeted soothing formula to diminish puffiness and fine lines.</p>",
    price: 48,
    originalPrice: 58,
    currencyCode: "USD",
    image: "/images/products/eye-serum-bottles.png",
    images: ["/images/products/eye-serum-bottles.png"],
    badge: "Sale",
    category: "serum",
    productType: "Serum",
    availableForSale: true,
  },
  {
    id: "cellular-glow-serum",
    shopifyId: "prod_cellular_glow_serum",
    variantId: "var_cellular_glow_serum",
    name: "Glow Serum",
    description: "Gentle daily serum powered by fermented botanicals and niacinamide.",
    descriptionHtml: "<p>Gentle daily serum powered by fermented botanicals and niacinamide.</p>",
    price: 50,
    originalPrice: null,
    currencyCode: "USD",
    image: "/images/products/spray-bottles.png",
    images: ["/images/products/spray-bottles.png"],
    badge: null,
    category: "serum",
    productType: "Serum",
    availableForSale: true,
  },
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
  
  const allProducts = products && products.length > 0 ? products : DEFAULT_PRODUCTS
  const categoryMatched = allProducts.filter(
    (product) => product.category === selectedCategory || product.productType?.toLowerCase() === selectedCategory
  )
  const filteredProducts = categoryMatched.length > 0 ? categoryMatched : allProducts

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
    allProducts.forEach((product) => {
      if (product.image) {
        const img = new window.Image()
        img.src = product.image
      }
    })
  }, [allProducts])

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
    
    window.addEventListener('scroll', handleScroll, { passive: true })
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
          {/* Header Row with Left Titles & Right Category Controls */}
          <div 
            ref={headerRef} 
            className="mb-12 mx-4 lg:mx-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6"
          >
            {/* Left Header */}
            <div>
              <span 
                className={`text-sm tracking-[0.3em] uppercase text-primary mb-3 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} 
                style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}
              >
                Our Collection
              </span>
              <h2 
                className={`font-serif leading-tight text-foreground mb-3 text-balance text-4xl sm:text-5xl lg:text-6xl xl:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} 
                style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}
              >
                Gentle essentials
              </h2>
              <p 
                className={`text-base sm:text-lg text-muted-foreground max-w-md ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} 
                style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}
              >
                Thoughtfully crafted products for your daily skincare ritual
              </p>
            </div>

            {/* Right side controls: Category Selector & Explore Link */}
            <div 
              className={`flex flex-wrap items-center gap-3.5 self-start lg:self-end ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} 
              style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}
            >
              {/* Category Segmented Control */}
              <div className="inline-flex p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/70 boty-shadow gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`px-5 py-2 rounded-full text-sm font-medium boty-transition cursor-pointer ${
                      selectedCategory === cat.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted/70"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* View All Button */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-background text-foreground/80 hover:text-foreground border border-border/60 boty-shadow boty-transition hover:scale-105"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Product Grid - Horizontal */}
          <div 
            ref={gridRef}
            className="flex gap-6 pl-4 lg:pl-8"
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
                            ? "bg-destructive/10 text-destructive font-medium"
                            : product.badge === "New"
                            ? "bg-primary/10 text-primary font-medium"
                            : "bg-accent text-accent-foreground font-medium"
                        }`}
                      >
                        {product.badge}
                      </span>
                    )}
                    
                    {/* Info with Progressive Blur */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      {/* Progressive blur overlay */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/45 to-transparent backdrop-blur-[6px]" 
                        style={{ maskImage: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, black 50%, transparent 100%)' }}
                      />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="font-serif text-lg text-white mb-1 font-medium">{product.name}</h3>
                        <p className="text-sm text-white/80 mb-3 line-clamp-2">{product.description}</p>
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
        </div>
      </div>
    </section>
  )
}
