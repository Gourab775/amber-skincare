"use client"

import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "New York",
    rating: 5,
    text: "My skin has never felt so soft and nourished. The Radiance Serum is now a permanent part of my morning routine.",
    product: "Radiance Serum"
  },
  {
    id: 2,
    name: "Emma L.",
    location: "Los Angeles",
    rating: 5,
    text: "Finally, skincare that actually feels natural. No more harsh chemicals. My sensitive skin loves AMBER products.",
    product: "Gentle Cleanser"
  },
  {
    id: 3,
    name: "Jessica R.",
    location: "Chicago",
    rating: 5,
    text: "The Hydra Cream is absolutely divine. It absorbs beautifully and keeps my skin hydrated all day long.",
    product: "Hydra Cream"
  },
  {
    id: 4,
    name: "Maria K.",
    location: "Miami",
    rating: 5,
    text: "I've tried countless serums but nothing compares to the glow I get from AMBER. Absolutely transformative.",
    product: "Glow Serum"
  },
  {
    id: 5,
    name: "Sophie T.",
    location: "Seattle",
    rating: 5,
    text: "The packaging is beautiful and sustainable. I feel good knowing I'm choosing eco-friendly skincare.",
    product: "Night Cream"
  },
  {
    id: 6,
    name: "Anna P.",
    location: "Boston",
    rating: 5,
    text: "My acne-prone skin has cleared up since switching to AMBER. Natural ingredients really make a difference.",
    product: "Gentle Cleanser"
  },
  {
    id: 7,
    name: "Claire B.",
    location: "Austin",
    rating: 5,
    text: "The texture of the Renewal Oil is perfection. It absorbs quickly and leaves my skin glowing.",
    product: "Renewal Oil"
  },
  {
    id: 8,
    name: "Lily W.",
    location: "Portland",
    rating: 5,
    text: "I love that AMBER is cruelty-free and vegan. Great products that align with my values.",
    product: "Hydra Cream"
  },
  {
    id: 9,
    name: "Rachel D.",
    location: "Denver",
    rating: 5,
    text: "The scent is so subtle and natural. No overpowering fragrances, just pure botanical goodness.",
    product: "Radiance Serum"
  }
]

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="rounded-3xl p-6 mb-4 flex-shrink-0">

    {/* Stars */}
    

    {/* Quote */}
    <p className="text-foreground/80 leading-relaxed mb-4 text-pretty font-medium text-xl font-serif tracking-wide">
      &ldquo;{testimonial.text}&rdquo;
    </p>

    {/* Author */}
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-foreground text-sm font-bold">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
      </div>
      <span className="text-xs tracking-wide text-primary/70 bg-primary/5 px-2 py-1 rounded-full whitespace-nowrap">
        {testimonial.product}
      </span>
    </div>
  </div>
)

export function Testimonials() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  
  const column1 = [testimonials[0], testimonials[3], testimonials[6]]
  const column2 = [testimonials[1], testimonials[4], testimonials[7]]
  const column3 = [testimonials[2], testimonials[5], testimonials[8]]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (headerRef.current) {
      observer.observe(headerRef.current)
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-background overflow-hidden pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            Kind Words
          </span>
          <h2 className={`font-serif text-4xl leading-tight text-foreground text-balance md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            Loved by thousands
          </h2>
        </div>

        {/* Scrolling Testimonials - Horizontal */}
        <div className="relative">
          {/* Gradient Overlays - Left & Right */}
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Row 1 - Scrolling Left */}
          <div className="relative overflow-hidden mb-4">
            <div className="animate-scroll-left hover:animate-scroll-left-slow flex gap-4 w-max">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div key={`row1-${testimonial.id}-${index}`} className="w-[350px] flex-shrink-0">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - Scrolling Right */}
          <div className="relative overflow-hidden">
            <div className="animate-scroll-right hover:animate-scroll-right-slow flex gap-4 w-max">
              {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((testimonial, index) => (
                <div key={`row2-${testimonial.id}-${index}`} className="w-[350px] flex-shrink-0">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }

        .animate-scroll-left-slow {
          animation: scroll-left 80s linear infinite;
        }

        .animate-scroll-right-slow {
          animation: scroll-right 80s linear infinite;
        }
      `}</style>
    </section>
  )
}
