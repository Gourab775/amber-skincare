"use server"

import { cookies } from "next/headers"
import {
  createCart,
  getCart,
  addToCart as addToCartApi,
  updateCartLine as updateCartLineApi,
  removeCartLine as removeCartLineApi,
  type Cart,
} from "@/lib/shopify"

const CART_COOKIE = "amber_cart_id"

async function setCartCookie(cartId: string) {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
}

// Resolves a usable cart id. Prefers the id passed from the client (survives
// environments where cookies aren't sent back, e.g. iframes), then the cookie,
// otherwise creates a new cart.
async function resolveCartId(clientCartId?: string): Promise<{ cartId: string; created?: Cart }> {
  if (clientCartId) {
    const existing = await getCart(clientCartId)
    if (existing) return { cartId: clientCartId }
  }

  const cookieStore = await cookies()
  const cookieId = cookieStore.get(CART_COOKIE)?.value
  if (cookieId) {
    const existing = await getCart(cookieId)
    if (existing) return { cartId: cookieId }
  }

  const cart = await createCart()
  await setCartCookie(cart.id)
  return { cartId: cart.id, created: cart }
}

export async function getCartAction(cartId?: string): Promise<Cart | null> {
  if (cartId) {
    const cart = await getCart(cartId)
    if (cart) return cart
  }
  const cookieStore = await cookies()
  const cookieId = cookieStore.get(CART_COOKIE)?.value
  if (!cookieId) return null
  return getCart(cookieId)
}

export async function addToCartAction(merchandiseId: string, quantity = 1, cartId?: string): Promise<Cart> {
  const { cartId: id } = await resolveCartId(cartId)
  return addToCartApi(id, merchandiseId, quantity)
}

export async function updateCartLineAction(lineId: string, quantity: number, cartId?: string): Promise<Cart> {
  const { cartId: id } = await resolveCartId(cartId)
  if (quantity <= 0) return removeCartLineApi(id, lineId)
  return updateCartLineApi(id, lineId, quantity)
}

export async function removeCartLineAction(lineId: string, cartId?: string): Promise<Cart> {
  const { cartId: id } = await resolveCartId(cartId)
  return removeCartLineApi(id, lineId)
}
