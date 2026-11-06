"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import {
  getCartAction,
  addToCartAction,
  updateCartLineAction,
  removeCartLineAction,
  clearCartAction,
} from "@/app/actions/cart"
import type { Cart } from "@/lib/shopify"
import { FALLBACK_PRODUCTS } from "@/lib/products-data"

const LOCAL_STORAGE_KEY = "amber_cart"

function saveCartToStorage(cart: Cart | null) {
  if (typeof window === "undefined") return
  try {
    if (cart && cart.lines && cart.lines.length > 0) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart))
    } else {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  } catch (e) {
    console.error("Storage save error:", e)
  }
}

function loadCartFromStorage(): Cart | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.lines)) return parsed
    }
  } catch (e) {
    console.error("Storage load error:", e)
  }
  return null
}

interface CartContextType {
  cart: Cart | null
  addItem: (variantId: string, quantity?: number) => Promise<void>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  clearCart: () => Promise<void>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  itemCount: number
  subtotal: number
  isPending: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const cartIdRef = useRef<string | undefined>(undefined)

  // 1. Initial hydration from localStorage immediately on mount
  useEffect(() => {
    const local = loadCartFromStorage()
    if (local && local.lines && local.lines.length > 0) {
      setCart(local)
      cartIdRef.current = local.id
    }

    // Background sync with server action
    getCartAction(local?.id)
      .then((c) => {
        if (c && c.lines && c.lines.length > 0) {
          cartIdRef.current = c.id
          setCart(c)
          saveCartToStorage(c)
        } else if (local && local.lines && local.lines.length > 0) {
          // If server session is fresh but client had items, keep client items
          setCart(local)
          saveCartToStorage(local)
        }
      })
      .catch((err) => console.log("[v0] Background cart sync note:", err))
  }, [])

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    setIsOpen(true)
    setIsPending(true)

    // Find product details
    const matched = FALLBACK_PRODUCTS.find(
      (p) => p.variantId === variantId || p.shopifyId === variantId || p.id === variantId
    ) || FALLBACK_PRODUCTS[0]

    // 1. Instantly update client-side cart & localStorage
    setCart((prev) => {
      const currentCart: Cart = prev || {
        id: cartIdRef.current || `cart_${Date.now()}`,
        checkoutUrl: "/checkout",
        totalQuantity: 0,
        cost: {
          subtotalAmount: { amount: "0.00", currencyCode: "USD" },
          totalAmount: { amount: "0.00", currencyCode: "USD" },
        },
        lines: [],
      }

      const lines = [...currentCart.lines]
      const existingIdx = lines.findIndex(
        (l) => l.merchandiseId === variantId || l.productHandle === matched.id
      )

      if (existingIdx > -1) {
        lines[existingIdx] = {
          ...lines[existingIdx],
          quantity: lines[existingIdx].quantity + quantity,
        }
      } else {
        lines.push({
          id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          quantity,
          merchandiseId: variantId,
          productHandle: matched.id,
          title: matched.name,
          image: matched.image,
          price: matched.price,
          currencyCode: matched.currencyCode,
        })
      }

      const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0)
      const subtotalVal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

      const updatedCart: Cart = {
        ...currentCart,
        lines,
        totalQuantity,
        cost: {
          subtotalAmount: { amount: subtotalVal.toFixed(2), currencyCode: "USD" },
          totalAmount: { amount: subtotalVal.toFixed(2), currencyCode: "USD" },
        },
      }

      cartIdRef.current = updatedCart.id
      saveCartToStorage(updatedCart)
      return updatedCart
    })

    // 2. Sync with server in background
    try {
      const serverUpdated = await addToCartAction(variantId, quantity, cartIdRef.current)
      if (serverUpdated && serverUpdated.lines && serverUpdated.lines.length > 0) {
        cartIdRef.current = serverUpdated.id
        setCart(serverUpdated)
        saveCartToStorage(serverUpdated)
      }
    } catch (err) {
      console.log("[v0] Server cart sync handled:", err)
    } finally {
      setIsPending(false)
    }
  }, [])

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    setIsPending(true)

    setCart((prev) => {
      if (!prev) return null
      let lines = [...prev.lines]

      if (quantity <= 0) {
        lines = lines.filter((l) => l.id !== lineId)
      } else {
        const idx = lines.findIndex((l) => l.id === lineId)
        if (idx > -1) {
          lines[idx] = { ...lines[idx], quantity }
        }
      }

      const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0)
      const subtotalVal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

      const updated: Cart = {
        ...prev,
        lines,
        totalQuantity,
        cost: {
          subtotalAmount: { amount: subtotalVal.toFixed(2), currencyCode: "USD" },
          totalAmount: { amount: subtotalVal.toFixed(2), currencyCode: "USD" },
        },
      }

      saveCartToStorage(updated)
      return updated
    })

    try {
      const serverUpdated = await updateCartLineAction(lineId, quantity, cartIdRef.current)
      if (serverUpdated) {
        cartIdRef.current = serverUpdated.id
        setCart(serverUpdated)
        saveCartToStorage(serverUpdated)
      }
    } catch (err) {
      console.log("[v0] Server update handled:", err)
    } finally {
      setIsPending(false)
    }
  }, [])

  const removeItem = useCallback(async (lineId: string) => {
    setIsPending(true)

    setCart((prev) => {
      if (!prev) return null
      const lines = prev.lines.filter((l) => l.id !== lineId)
      const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0)
      const subtotalVal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

      const updated: Cart = {
        ...prev,
        lines,
        totalQuantity,
        cost: {
          subtotalAmount: { amount: subtotalVal.toFixed(2), currencyCode: "USD" },
          totalAmount: { amount: subtotalVal.toFixed(2), currencyCode: "USD" },
        },
      }

      saveCartToStorage(updated)
      return updated
    })

    try {
      const serverUpdated = await removeCartLineAction(lineId, cartIdRef.current)
      if (serverUpdated) {
        cartIdRef.current = serverUpdated.id
        setCart(serverUpdated)
        saveCartToStorage(serverUpdated)
      }
    } catch (err) {
      console.log("[v0] Server remove handled:", err)
    } finally {
      setIsPending(false)
    }
  }, [])

  const clearCart = useCallback(async () => {
    setIsPending(true)
    saveCartToStorage(null)
    setCart(null)
    try {
      await clearCartAction(cartIdRef.current)
    } catch (err) {
      console.log("[v0] Server clear handled:", err)
    } finally {
      setIsPending(false)
    }
  }, [])

  const itemCount = cart?.totalQuantity ?? 0
  const subtotal = cart ? Number.parseFloat(cart.cost.subtotalAmount.amount) : 0

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isOpen,
        setIsOpen,
        itemCount,
        subtotal,
        isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
