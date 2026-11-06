"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  CheckCircle,
  Truck,
  Package,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"

interface OrderDetails {
  orderId: string
  date: string
  email: string
  customerName: string
  shippingAddress: {
    address: string
    apartment?: string
    city: string
    state?: string
    zip: string
    country: string
  }
  shippingMethod: string
  shippingCost: number
  paymentMethod: string
  items: {
    id: string
    title: string
    price: number
    quantity: number
    image: string
  }[]
  subtotal: number
  discountAmount: number
  grandTotal: number
  currency: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get("orderId")
  const [order, setOrder] = useState<OrderDetails | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("amber_last_order")
        if (stored) {
          const parsed: OrderDetails = JSON.parse(stored)
          if (!orderIdParam || parsed.orderId === orderIdParam) {
            setOrder(parsed)
            return
          }
        }
      } catch (err) {
        console.error("Failed to read order:", err)
      }

      // Fallback sample order if direct link visited
      const fallbackOrder: OrderDetails = {
        orderId: orderIdParam || "AMB-783921",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        email: "customer@amberskincare.com",
        customerName: "Valued Customer",
        shippingAddress: {
          address: "124 Olive Blossom Way",
          apartment: "Suite 4B",
          city: "Los Angeles",
          state: "CA",
          zip: "90210",
          country: "United States",
        },
        shippingMethod: "standard",
        shippingCost: 0,
        paymentMethod: "card",
        items: [
          {
            id: "hydra-barrier-cream",
            title: "Hydra Barrier Cream",
            price: 48,
            quantity: 1,
            image: "/images/products/cream-jars-colored.png",
          },
          {
            id: "radiance-vitamin-c-serum",
            title: "Radiance Serum",
            price: 62,
            quantity: 1,
            image: "/images/products/serum.jpg",
          },
        ],
        subtotal: 110,
        discountAmount: 0,
        grandTotal: 110,
        currency: "USD",
      }
      setOrder(fallbackOrder)
    }
  }, [orderIdParam])

  const formatPrice = (amount: number, curr = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: curr }).format(amount)

  if (!order) return null

  // Calculate estimated delivery: 3 to 5 days ahead
  const today = new Date()
  const estMin = new Date(today)
  estMin.setDate(today.getDate() + 3)
  const estMax = new Date(today)
  estMax.setDate(today.getDate() + 5)

  const estRangeStr = `${estMin.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${estMax.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-24">
      {/* Thank you header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <CheckCircle className="w-10 h-10 animate-scale-fade-in" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold block mb-2">
          Order Confirmed
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground mb-4">
          Thank you for your order!
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
          We&apos;ve received your order and are carefully preparing your natural skincare essentials.
        </p>
      </div>

      {/* Order Status & ID banner */}
      <div className="bg-card rounded-3xl p-6 md:p-8 boty-shadow mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
              Order Number
            </span>
            <span className="font-serif text-2xl font-bold text-foreground">
              {order.orderId}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/order-tracking?orderId=${order.orderId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 boty-transition boty-shadow cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order Live</span>
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-medium bg-background border border-border/70 text-foreground/80 hover:text-foreground boty-transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Receipt</span>
            </button>
          </div>
        </div>

        {/* Timeline Progress */}
        <div className="pt-8 pb-4">
          <div className="grid grid-cols-4 gap-2 text-center relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mb-2 shadow-sm">
                ✓
              </div>
              <span className="text-xs font-medium text-foreground">Confirmed</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">Just now</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold mb-2">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-foreground">Formulating</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">In batch</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold mb-2">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Dispatched</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">Eco-Courier</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold mb-2">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Delivered</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">At doorstep</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Shipping & Delivery Info */}
        <div className="bg-card rounded-3xl p-6 md:p-8 boty-shadow space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg font-medium text-foreground">Shipping Details</h3>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs uppercase text-muted-foreground block mb-0.5">Recipient</span>
              <p className="font-medium text-foreground">{order.customerName}</p>
              <p className="text-muted-foreground">{order.email}</p>
            </div>

            <div>
              <span className="text-xs uppercase text-muted-foreground block mb-0.5">Shipping Address</span>
              <p className="text-foreground">
                {order.shippingAddress.address}
                {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}
              </p>
              <p className="text-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
            </div>

            <div className="pt-2 border-t border-border/40">
              <span className="text-xs uppercase text-muted-foreground block mb-0.5">
                Estimated Delivery Window
              </span>
              <p className="font-medium text-primary flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{estRangeStr}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment & Summary Info */}
        <div className="bg-card rounded-3xl p-6 md:p-8 boty-shadow space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg font-medium text-foreground">Payment Summary</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Payment Status</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Paid & Verified</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Payment Method</span>
              <span className="text-foreground capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal, order.currency)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>-{formatPrice(order.discountAmount, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost, order.currency)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-foreground pt-3 border-t border-border/60">
              <span>Total Paid</span>
              <span className="font-serif text-xl font-bold text-primary">
                {formatPrice(order.grandTotal, order.currency)}
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Tax invoice sent to your email address</span>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-card rounded-3xl p-6 md:p-8 boty-shadow mb-12">
        <h3 className="font-serif text-xl font-medium text-foreground mb-6 pb-4 border-b border-border/50">
          Items Ordered ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
        </h3>

        <div className="divide-y divide-border/40">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-background overflow-hidden flex-shrink-0 border border-border/60">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm truncate">{item.title}</h4>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity} · {formatPrice(item.price, order.currency)} each
                </p>
              </div>
              <span className="font-semibold text-sm text-foreground">
                {formatPrice(item.price * item.quantity, order.currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/shop"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 boty-transition boty-shadow cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-medium bg-background text-foreground/80 hover:text-foreground border border-border/70 boty-transition boty-shadow cursor-pointer"
        >
          <span>Return Home</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
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
        <SuccessContent />
      </Suspense>
      <Footer />
    </main>
  )
}
