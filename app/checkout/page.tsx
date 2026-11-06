"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ShieldCheck,
  Lock,
  ChevronLeft,
  CreditCard,
  Truck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
} from "lucide-react"
import { useCart } from "@/components/boty/cart-context"
import { FALLBACK_PRODUCTS } from "@/lib/products-data"

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cart, subtotal, clearCart, addItem } = useCart()
  const [isPending, startTransition] = useTransition()

  // Buy now query handling
  const buyNowId = searchParams.get("buyNow")
  const buyNowQty = Number.parseInt(searchParams.get("qty") || "1", 10)
  const buyNowProduct = buyNowId
    ? FALLBACK_PRODUCTS.find((p) => p.id === buyNowId || p.variantId === buyNowId)
    : null

  // Local storage fallback state
  const [storedLines, setStoredLines] = useState<any[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("amber_cart")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && Array.isArray(parsed.lines) && parsed.lines.length > 0) {
            setStoredLines(parsed.lines)
          }
        }
      } catch (e) {
        console.error("Storage error:", e)
      }
    }
  }, [])

  // Auto-sync buyNow item if cart was empty
  useEffect(() => {
    if (buyNowProduct) {
      const hasItem = (cart?.lines || []).some(
        (l) => l.merchandiseId === buyNowProduct.variantId || l.productHandle === buyNowProduct.id
      )
      if (!hasItem) {
        addItem(buyNowProduct.variantId, buyNowQty)
      }
    }
  }, [buyNowProduct, buyNowQty, cart?.lines, addItem])

  // Form states
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [apartment, setApartment] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")
  const [country, setCountry] = useState("United States")

  // Shipping & Payment
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card")

  // Card fields
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")

  // Promo code
  const [promoCode, setPromoCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null)
  const [promoError, setPromoError] = useState("")
  const [promoSuccess, setPromoSuccess] = useState("")

  // Resolve active lines with triple fallback:
  // 1. cart.lines from context
  // 2. storedLines from localStorage
  // 3. buyNowProduct from URL
  const contextLines = cart?.lines || []
  let activeLines = contextLines
  if (activeLines.length === 0 && storedLines.length > 0) {
    activeLines = storedLines
  }
  if (activeLines.length === 0 && buyNowProduct) {
    activeLines = [
      {
        id: `buynow_${buyNowProduct.id}`,
        title: buyNowProduct.name,
        price: buyNowProduct.price,
        quantity: buyNowQty,
        image: buyNowProduct.image,
        merchandiseId: buyNowProduct.variantId,
        productHandle: buyNowProduct.id,
        currencyCode: buyNowProduct.currencyCode,
      },
    ]
  }

  const effectiveSubtotal = activeLines.reduce(
    (sum, line) => sum + (line.price || 0) * (line.quantity || 1),
    0
  )
  const currency = cart?.cost.subtotalAmount.currencyCode ?? "USD"

  const shippingCost = shippingMethod === "express" ? 12 : 0
  const discountAmount = appliedDiscount
    ? Math.round(effectiveSubtotal * appliedDiscount * 100) / 100
    : 0
  const grandTotal = Math.max(0, effectiveSubtotal - discountAmount + shippingCost)

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    setPromoError("")
    setPromoSuccess("")
    const code = promoCode.trim().toUpperCase()

    if (!code) return

    if (code === "AMBER10" || code === "WELCOME10") {
      setAppliedDiscount(0.1)
      setPromoSuccess("10% discount applied!")
    } else if (code === "NATURE15" || code === "AMBER15") {
      setAppliedDiscount(0.15)
      setPromoSuccess("15% botanical discount applied!")
    } else {
      setPromoError("Invalid code. Try 'AMBER10' for 10% off.")
    }
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !firstName || !lastName || !address || !city || !zip) {
      alert("Please fill in all required shipping and contact details.")
      return
    }

    startTransition(async () => {
      const orderId = `AMB-${Math.floor(100000 + Math.random() * 900000)}`
      const orderData = {
        orderId,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        email,
        phone,
        customerName: `${firstName} ${lastName}`.trim(),
        shippingAddress: {
          address,
          apartment,
          city,
          state,
          zip,
          country,
        },
        shippingMethod,
        shippingCost,
        paymentMethod,
        items: activeLines.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: effectiveSubtotal,
        discountAmount,
        grandTotal,
        currency,
      }

      // Save order info locally for order success & tracking lookup
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("amber_last_order", JSON.stringify(orderData))
          const existingOrders = JSON.parse(window.localStorage.getItem("amber_all_orders") || "[]")
          existingOrders.unshift(orderData)
          window.localStorage.setItem("amber_all_orders", JSON.stringify(existingOrders))
        } catch (e) {
          console.error("Storage error:", e)
        }
      }

      // Clear the shopping cart
      await clearCart()

      // Redirect to confirmation page
      router.push(`/checkout/success?orderId=${orderId}`)
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Checkout Minimal Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
            <div className="h-5 w-px bg-border/60" />
            <Link href="/">
              <span className="font-serif text-2xl tracking-wider text-foreground font-semibold">
                AMBER
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-primary" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: Customer Info, Shipping & Payment */}
            <div className="lg:col-span-7">
              <form onSubmit={handlePlaceOrder} className="space-y-10">
                {/* 1. Contact Info */}
                <section className="bg-card rounded-3xl p-6 md:p-8 boty-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl text-foreground font-medium">
                      1. Contact Information
                    </h2>
                    <span className="text-xs text-muted-foreground tracking-wide uppercase">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                        />
                        <span>Receive order tracking SMS & email notifications</span>
                      </label>
                    </div>
                  </div>
                </section>

                {/* 2. Shipping Address */}
                <section className="bg-card rounded-3xl p-6 md:p-8 boty-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl text-foreground font-medium">
                      2. Shipping Address
                    </h2>
                    <Truck className="w-5 h-5 text-primary" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Country / Region
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground boty-transition"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="India">India</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Sophia"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Laurent"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="124 Olive Blossom Way"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Apartment, Suite, Unit (Optional)
                      </label>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Suite 4B"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Los Angeles"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                          State / Prov
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="CA"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          placeholder="90210"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Options */}
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-4">
                      Delivery Method
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setShippingMethod("standard")}
                        className={`p-4 rounded-2xl border cursor-pointer boty-transition flex items-center justify-between ${
                          shippingMethod === "standard"
                            ? "border-primary bg-primary/5"
                            : "border-border/80 bg-background hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              shippingMethod === "standard" ? "border-primary" : "border-muted-foreground"
                            }`}
                          >
                            {shippingMethod === "standard" && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Standard Botanical</p>
                            <p className="text-xs text-muted-foreground">3-5 business days</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-primary uppercase">Free</span>
                      </div>

                      <div
                        onClick={() => setShippingMethod("express")}
                        className={`p-4 rounded-2xl border cursor-pointer boty-transition flex items-center justify-between ${
                          shippingMethod === "express"
                            ? "border-primary bg-primary/5"
                            : "border-border/80 bg-background hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              shippingMethod === "express" ? "border-primary" : "border-muted-foreground"
                            }`}
                          >
                            {shippingMethod === "express" && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Express Eco Courier</p>
                            <p className="text-xs text-muted-foreground">1-2 business days</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-foreground">$12.00</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Payment Method */}
                <section className="bg-card rounded-3xl p-6 md:p-8 boty-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl text-foreground font-medium">
                      3. Payment Method
                    </h2>
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>

                  <div className="space-y-4">
                    {/* Method Selector */}
                    <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-background border border-border/70">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`py-3 rounded-xl text-xs md:text-sm font-medium boty-transition cursor-pointer ${
                          paymentMethod === "card"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        Credit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("upi")}
                        className={`py-3 rounded-xl text-xs md:text-sm font-medium boty-transition cursor-pointer ${
                          paymentMethod === "upi"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        UPI / GPay
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={`py-3 rounded-xl text-xs md:text-sm font-medium boty-transition cursor-pointer ${
                          paymentMethod === "cod"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        Pay on Delivery
                      </button>
                    </div>

                    {/* Card Inputs */}
                    {paymentMethod === "card" && (
                      <div className="space-y-3 pt-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4242 •••• •••• 4242"
                              maxLength={19}
                              className="w-full pl-4 pr-10 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                            />
                            <CreditCard className="w-5 h-5 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                              Expiration Date
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM / YY"
                              maxLength={5}
                              className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                              Security Code (CVC)
                            </label>
                            <input
                              type="password"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              placeholder="•••"
                              maxLength={4}
                              className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Sophia Laurent"
                            className="w-full px-4 py-3 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60 boty-transition"
                          />
                        </div>
                      </div>
                    )}

                    {/* UPI Option */}
                    {paymentMethod === "upi" && (
                      <div className="p-4 rounded-2xl bg-background border border-border/80 text-sm text-muted-foreground">
                        <p className="mb-2 font-medium text-foreground">Fast & Secure UPI Transfer</p>
                        <p className="text-xs">
                          You will be prompted to approve the transaction via your chosen UPI app (Google Pay, Apple Pay, PhonePe, or Paytm) on the confirmation step.
                        </p>
                      </div>
                    )}

                    {/* COD Option */}
                    {paymentMethod === "cod" && (
                      <div className="p-4 rounded-2xl bg-background border border-border/80 text-sm text-muted-foreground">
                        <p className="mb-2 font-medium text-foreground">Cash on Delivery</p>
                        <p className="text-xs">
                          Pay in cash or contactless mobile transfer upon delivery at your doorstep. Verified delivery partner will hand over sealed AMBER packaging.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending || activeLines.length === 0}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium hover:bg-primary/90 boty-transition boty-shadow text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <span>Processing Your Order...</span>
                  ) : (
                    <>
                      <span>Complete Purchase · {formatPrice(grandTotal)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-card rounded-3xl p-6 md:p-8 boty-shadow sticky top-28">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                  <h3 className="font-serif text-xl text-foreground font-medium">Order Summary</h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {activeLines.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    {activeLines.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* Items List */}
                {activeLines.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium">No items in cart</p>
                    <Link
                      href="/shop"
                      className="mt-3 inline-block text-xs font-semibold text-primary underline"
                    >
                      Browse Skincare Collection
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1 mb-6">
                    {activeLines.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-xl bg-background overflow-hidden flex-shrink-0 border border-border/50">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="mb-6 pt-4 border-t border-border/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Discount code (try AMBER10)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border/80 focus:border-primary focus:outline-none text-xs text-foreground placeholder:text-muted-foreground/60 boty-transition"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 boty-transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoSuccess && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3 h-3" />
                      {promoSuccess}
                    </p>
                  )}
                  {promoError && (
                    <p className="text-xs text-rose-500 mt-2">{promoError}</p>
                  )}
                </form>

                {/* Financial Summary */}
                <div className="space-y-3 pt-4 border-t border-border/50 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(effectiveSubtotal)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Promo Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium text-foreground pt-3 border-t border-border/60">
                    <span>Total Due</span>
                    <span className="text-xl font-serif font-bold text-primary">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Guarantee Badges */}
                <div className="mt-8 pt-6 border-t border-border/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Pure botanical ingredients certified cruelty-free</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>30-Day Happiness & Satisfaction Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>100% Recyclable sustainable glass packaging</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
