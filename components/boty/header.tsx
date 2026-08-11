"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag, Search, User } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { useCart } from "./cart-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setIsOpen, itemCount } = useCart()

  return (
    <header className="fixed top-0 left-0 z-50 px-4 pt-4">
      <nav className="w-fit px-6 lg:px-8 backdrop-blur-md rounded-lg py-0 my-0 animate-scale-fade-in bg-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.32)]" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>
        <div className="flex items-center gap-8 h-[68px]">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-foreground/80 hover:text-foreground boty-transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/">
            <h1 className="font-serif text-3xl tracking-wider text-foreground">AMBER</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#collection"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Collection
            </a>
            <a
              href="#why-amber"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('why-amber')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Why AMBER
            </a>
            <a
              href="#impact"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Impact
            </a>
            <a
              href="#ingredients"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('ingredients')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Ingredients
            </a>
            <a
              href="#reviews"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Reviews
            </a>
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0 -right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-4 ml-auto">
            <button
              type="button"
              className="p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0 -right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <CartDrawer />

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden boty-transition ${
            isMenuOpen ? "max-h-64 pb-6" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
            <a
              href="#collection"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                setIsMenuOpen(false)
                document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Collection
            </a>
            <a
              href="#why-amber"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                setIsMenuOpen(false)
                document.getElementById('why-amber')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Why AMBER
            </a>
            <a
              href="#impact"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                setIsMenuOpen(false)
                document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Impact
            </a>
            <a
              href="#ingredients"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                setIsMenuOpen(false)
                document.getElementById('ingredients')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Ingredients
            </a>
            <a
              href="#reviews"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={(e) => {
                e.preventDefault()
                setIsMenuOpen(false)
                document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Reviews
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}
