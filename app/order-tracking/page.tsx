"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  Search,
  MapPin,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"

function TrackingContent() {
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("orderId") || ""

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId)
  const [searchedOrder, setSearchedOrder] = useState<any>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = (id: string) => {
    const cleanId = id.trim().toUpperCase()
    if (!cleanId) return

    setHasSearched(true)

    if (typeof window !== "undefined") {
      try {
        const storedOrders = JSON.parse(window.localStorage.getItem("amber_all_orders") || "[]")
        const found = storedOrders.find((o: any) => o.orderId.toUpperCase() === cleanId)
        if (found) {
          setSearchedOrder(found)
          return
        }

        const lastOrder = JSON.parse(window.localStorage.getItem("amber_last_order") || "null")
        if (lastOrder && lastOrder.orderId.toUpperCase() === cleanId) {
          setSearchedOrder(lastOrder)
          return
        }
      } catch (err) {
        console.error("Storage error:", err)
      }
    }

    // Default mock tracking data for any other query
    setSearchedOrder({
      orderId: cleanId,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      customerName: "Skincare Lover",
      email: "guest@amberskincare.com",
      status: "Dispatched",
      trackingNumber: `ECO-${cleanId.replace(/[^0-9]/g, "") || "482910"}`,
      courier: "GreenEco Logistics",
      estimatedDelivery: "3 - 5 business days",
      shippingAddress: {
        address: "124 Olive Blossom Way",
        city: "Los Angeles",
        state: "CA",
        zip: "90210",
        country: "United States",
      },
      items: [
        {
          id: "amber-renewal-oil",
          title: "Renewal Face Oil",
          price: 58,
          quantity: 1,
          image: "/images/products/amber-dropper-bottles.png",
        },
      ],
      grandTotal: 58,
      currency: "USD",
    })
  }

  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId)
      performSearch(initialOrderId)
    }
  }, [initialOrderId])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(orderIdInput)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-24">
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold block mb-2">
          Real-Time Tracking
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground mb-4">
          Track Your Delivery
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
          Enter your AMBER Order ID to check handcrafted preparation & shipment progress.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="max-w-xl mx-auto mb-12 bg-card p-2 rounded-full boty-shadow flex items-center border border-border/70"
      >
        <div className="pl-4 pr-2 text-muted-foreground">
          <Search className="w-5 h-5 text-primary" />
        </div>
        <input
          type="text"
          value={orderIdInput}
          onChange={(e) => setOrderIdInput(e.target.value)}
          placeholder="Enter Order ID (e.g. AMB-948210)"
          className="flex-1 bg-transparent py-3 px-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 boty-transition boty-shadow cursor-pointer"
        >
          Track
        </button>
      </form>

      {/* Tracking Result */}
      {hasSearched && searchedOrder && (
        <div className="space-y-8 animate-scale-fade-in">
          {/* Main Status Card */}
          <div className="bg-card rounded-3xl p-6 md:p-8 boty-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                  Tracking for Order
                </span>
                <span className="font-serif text-2xl font-bold text-foreground">
                  {searchedOrder.orderId}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>On Schedule</span>
                </span>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Courier: {searchedOrder.courier || "Eco-Courier Express"}
                </p>
              </div>
            </div>

            {/* Stepper */}
            <div className="py-8 border-b border-border/50">
              <div className="grid grid-cols-4 gap-2 text-center relative">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mb-2 shadow-sm">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">Order Placed</span>
                  <span className="text-[10px] text-muted-foreground">{searchedOrder.date}</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mb-2 shadow-sm">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">Handcrafted</span>
                  <span className="text-[10px] text-muted-foreground">Formulated</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mb-2">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-primary">In Transit</span>
                  <span className="text-[10px] text-muted-foreground">Courier pickup</span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold mb-2">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Delivered</span>
                  <span className="text-[10px] text-muted-foreground">Pending</span>
                </div>
              </div>
            </div>

            {/* Tracking Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-sm">
              <div>
                <span className="text-xs uppercase text-muted-foreground block mb-1">
                  Tracking Code
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {searchedOrder.trackingNumber || "ECO-AMB-88392"}
                </span>
              </div>
              <div>
                <span className="text-xs uppercase text-muted-foreground block mb-1">
                  Destination
                </span>
                <span className="text-sm font-medium text-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    {searchedOrder.shippingAddress?.city || "Los Angeles"},{" "}
                    {searchedOrder.shippingAddress?.country || "United States"}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-xs uppercase text-muted-foreground block mb-1">
                  Estimated Arrival
                </span>
                <span className="text-sm font-medium text-primary flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{searchedOrder.estimatedDelivery || "3 – 5 Business Days"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Package items summary */}
          {searchedOrder.items && searchedOrder.items.length > 0 && (
            <div className="bg-card rounded-3xl p-6 md:p-8 boty-shadow">
              <h3 className="font-serif text-lg font-medium text-foreground mb-4 pb-3 border-b border-border/50">
                Package Contents
              </h3>
              <div className="divide-y divide-border/40">
                {searchedOrder.items.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-background overflow-hidden flex-shrink-0 border border-border/50">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helpful links */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Need help with your order? Our botanical care team is ready to assist.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 boty-transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-background border border-border/70 text-foreground hover:bg-card boty-transition"
          >
            <span>Back to Home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderTrackingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        }
      >
        <TrackingContent />
      </Suspense>
      <Footer />
    </main>
  )
}
