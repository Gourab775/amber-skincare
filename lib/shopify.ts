import "server-only"

const API_VERSION = "2025-04"

type ShopifyFetchOptions = {
  query: string
  variables?: Record<string, unknown>
  cache?: RequestCache
  tags?: string[]
}

export async function shopifyFetch<T>({ query, variables, cache = "force-cache", tags }: ShopifyFetchOptions): Promise<T> {
  // Read env vars at request time, not module-load time, so they're reliably available.
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!storeDomain || !accessToken) {
    throw new Error("Missing Shopify environment variables")
  }

  const endpoint = `https://${storeDomain}/api/${API_VERSION}/graphql.json`

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    ...(tags ? { next: { tags } } : {}),
  })

  if (!res.ok) {
    throw new Error(`Shopify fetch failed: ${res.status} ${res.statusText}`)
  }

  const body = await res.json()

  if (body.errors) {
    console.log("[v0] Shopify GraphQL errors:", JSON.stringify(body.errors))
    throw new Error(body.errors[0]?.message ?? "Shopify GraphQL error")
  }

  return body.data as T
}

// ---- Types ----

export type Product = {
  id: string // handle, used as the route id
  shopifyId: string
  variantId: string
  name: string
  description: string
  descriptionHtml: string
  price: number
  originalPrice: number | null
  currencyCode: string
  image: string
  images: string[]
  badge: string | null
  category: "cream" | "oil" | "serum"
  productType: string
  availableForSale: boolean
}

type ShopifyImage = { url: string; altText: string | null }

type ShopifyProductNode = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  productType: string
  tags: string[]
  featuredImage: ShopifyImage | null
  images: { edges: { node: ShopifyImage }[] }
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
  compareAtPriceRange: { minVariantPrice: { amount: string } }
  variants: {
    edges: { node: { id: string; availableForSale: boolean } }[]
  }
}

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    tags
    featuredImage { url altText }
    images(first: 6) { edges { node { url altText } } }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount } }
    variants(first: 1) { edges { node { id availableForSale } } }
  }
`

function mapCategory(productType: string): Product["category"] {
  const t = (productType || "").toLowerCase()
  if (t === "oil") return "oil"
  if (t === "serum") return "serum"
  return "cream"
}

function mapBadge(tags: string[]): string | null {
  const lower = tags.map((t) => t.toLowerCase())
  if (lower.includes("sale")) return "Sale"
  if (lower.includes("new")) return "New"
  if (lower.includes("bestseller")) return "Bestseller"
  return null
}

function normalizeProduct(node: ShopifyProductNode): Product {
  const price = Number.parseFloat(node.priceRange.minVariantPrice.amount)
  const compareAt = Number.parseFloat(node.compareAtPriceRange?.minVariantPrice?.amount ?? "0")
  const images = node.images.edges.map((e) => e.node.url)

  return {
    id: node.handle,
    shopifyId: node.id,
    variantId: node.variants.edges[0]?.node.id ?? "",
    name: node.title,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    price,
    originalPrice: compareAt > price ? compareAt : null,
    currencyCode: node.priceRange.minVariantPrice.currencyCode,
    image: node.featuredImage?.url ?? images[0] ?? "/placeholder.svg",
    images: images.length ? images : node.featuredImage ? [node.featuredImage.url] : [],
    badge: mapBadge(node.tags),
    category: mapCategory(node.productType),
    productType: node.productType,
    availableForSale: node.variants.edges[0]?.node.availableForSale ?? false,
  }
}

export const FALLBACK_PRODUCTS: Product[] = [
  // Creams
  {
    id: "hydra-barrier-cream",
    shopifyId: "prod_hydra_barrier_cream",
    variantId: "var_hydra_barrier_cream",
    name: "Hydra Barrier Cream",
    description: "Deeply nourishing moisture cream with ceramides and shea butter for intense long-lasting hydration.",
    descriptionHtml: "<p>Deeply nourishing moisture cream with ceramides and shea butter for intense long-lasting hydration.</p>",
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
    description: "Overnight restorative treatment formulated with peptides and botanical extracts to firm and replenish.",
    descriptionHtml: "<p>Overnight restorative treatment formulated with peptides and botanical extracts to firm and replenish.</p>",
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
    description: "Lightweight daytime hydration with botanical extracts and squalane for a soft, velvety matte finish.",
    descriptionHtml: "<p>Lightweight daytime hydration with botanical extracts and squalane for a soft, velvety matte finish.</p>",
    price: 42,
    originalPrice: 50,
    currencyCode: "USD",
    image: "/images/products/moisturizer.jpg",
    images: ["/images/products/moisturizer.jpg", "/images/products/pump-bottles-cream.png"],
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
    description: "Velvety skin-repair cream infused with organic aloe vera, calendula, and rich essential fatty acids.",
    descriptionHtml: "<p>Velvety skin-repair cream infused with organic aloe vera, calendula, and rich essential fatty acids.</p>",
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

  // Oils
  {
    id: "amber-renewal-oil",
    shopifyId: "prod_amber_renewal_oil",
    variantId: "var_amber_renewal_oil",
    name: "Renewal Face Oil",
    description: "Luxurious cold-pressed oil blend rich in antioxidants and omegas to restore youthful suppleness.",
    descriptionHtml: "<p>Luxurious cold-pressed oil blend rich in antioxidants and omegas to restore youthful suppleness.</p>",
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
    description: "Restores natural lipid barrier with cold-pressed rosehip, jojoba, and vitamin E.",
    descriptionHtml: "<p>Restores natural lipid barrier with cold-pressed rosehip, jojoba, and vitamin E.</p>",
    price: 52,
    originalPrice: 65,
    currencyCode: "USD",
    image: "/images/products/oil.jpg",
    images: ["/images/products/oil.jpg", "/images/products/0ed61900-dd29-4dd2-bc2d-abc2db54c352.png"],
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
    description: "Infused with sea buckthorn and neroli to illuminate tired skin and lock in moisture all day.",
    descriptionHtml: "<p>Infused with sea buckthorn and neroli to illuminate tired skin and lock in moisture all day.</p>",
    price: 64,
    originalPrice: null,
    currencyCode: "USD",
    image: "/images/products/0ed61900-dd29-4dd2-bc2d-abc2db54c352.png",
    images: ["/images/products/0ed61900-dd29-4dd2-bc2d-abc2db54c352.png", "/images/products/amber-dropper-bottles.png"],
    badge: "New",
    category: "oil",
    productType: "Oil",
    availableForSale: true,
  },

  // Serums
  {
    id: "radiance-vitamin-c-serum",
    shopifyId: "prod_radiance_vitamin_c_serum",
    variantId: "var_radiance_vitamin_c_serum",
    name: "Radiance Serum",
    description: "Potent botanical vitamin C serum that protects against pollutants and reveals a bright, even complexion.",
    descriptionHtml: "<p>Potent botanical vitamin C serum that protects against pollutants and reveals a bright, even complexion.</p>",
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
    description: "Multi-molecular hyaluronic acid delivers deep moisture to multiple skin layers for all-day plumpness.",
    descriptionHtml: "<p>Multi-molecular hyaluronic acid delivers deep moisture to multiple skin layers for all-day plumpness.</p>",
    price: 56,
    originalPrice: null,
    currencyCode: "USD",
    image: "/images/products/serum-bottles-1.png",
    images: ["/images/products/serum-bottles-1.png", "/images/products/eye-serum-bottles.png"],
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
    description: "Targeted soothing formula with green tea and peptides to diminish puffiness and fine lines.",
    descriptionHtml: "<p>Targeted soothing formula with green tea and peptides to diminish puffiness and fine lines.</p>",
    price: 48,
    originalPrice: 58,
    currencyCode: "USD",
    image: "/images/products/eye-serum-bottles.png",
    images: ["/images/products/eye-serum-bottles.png", "/images/products/spray-bottles.png"],
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
    description: "Gentle hydrating daily serum powered by fermented botanicals, niacinamide, and rosewater.",
    descriptionHtml: "<p>Gentle hydrating daily serum powered by fermented botanicals, niacinamide, and rosewater.</p>",
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

export async function getProducts(): Promise<Product[]> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!storeDomain || !accessToken) {
    return FALLBACK_PRODUCTS
  }

  try {
    const data = await shopifyFetch<{ products: { edges: { node: ShopifyProductNode }[] } }>({
      query: `
        ${PRODUCT_FRAGMENT}
        query GetProducts {
          products(first: 50, sortKey: CREATED_AT) {
            edges { node { ...ProductFields } }
          }
        }
      `,
      tags: ["products"],
    })

    const fetched = data.products.edges.map((e) => normalizeProduct(e.node))
    return fetched.length > 0 ? fetched : FALLBACK_PRODUCTS
  } catch (error) {
    console.warn("Using fallback products due to Shopify error:", error)
    return FALLBACK_PRODUCTS
  }
}

export async function getProduct(handle: string): Promise<Product | null> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!storeDomain || !accessToken) {
    return FALLBACK_PRODUCTS.find((p) => p.id === handle) ?? null
  }

  try {
    const data = await shopifyFetch<{ product: ShopifyProductNode | null }>({
      query: `
        ${PRODUCT_FRAGMENT}
        query GetProduct($handle: String!) {
          product(handle: $handle) { ...ProductFields }
        }
      `,
      variables: { handle },
      tags: ["products"],
    })

    return data.product ? normalizeProduct(data.product) : (FALLBACK_PRODUCTS.find((p) => p.id === handle) ?? null)
  } catch {
    return FALLBACK_PRODUCTS.find((p) => p.id === handle) ?? null
  }
}

// ---- Cart ----

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: { amount: string; currencyCode: string }
    totalAmount: { amount: string; currencyCode: string }
  }
  lines: CartLine[]
}

export type CartLine = {
  id: string
  quantity: number
  merchandiseId: string
  productHandle: string
  title: string
  image: string
  price: number
  currencyCode: string
}

type ShopifyCart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: { amount: string; currencyCode: string }
    totalAmount: { amount: string; currencyCode: string }
  }
  lines: {
    edges: {
      node: {
        id: string
        quantity: number
        cost: { totalAmount: { amount: string; currencyCode: string } }
        merchandise: {
          id: string
          price: { amount: string; currencyCode: string }
          product: { handle: string; title: string; featuredImage: ShopifyImage | null }
        }
      }
    }[]
  }
}

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost { totalAmount { amount currencyCode } }
          merchandise {
            ... on ProductVariant {
              id
              price { amount currencyCode }
              product { handle title featuredImage { url altText } }
            }
          }
        }
      }
    }
  }
`

function normalizeCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: cart.cost,
    lines: cart.lines.edges.map((e) => ({
      id: e.node.id,
      quantity: e.node.quantity,
      merchandiseId: e.node.merchandise.id,
      productHandle: e.node.merchandise.product.handle,
      title: e.node.merchandise.product.title,
      image: e.node.merchandise.product.featuredImage?.url ?? "/placeholder.svg",
      price: Number.parseFloat(e.node.merchandise.price.amount),
      currencyCode: e.node.merchandise.price.currencyCode,
    })),
  }
}

type CartMutationResult = {
  cart: ShopifyCart | null
  userErrors?: { field: string[] | null; message: string }[]
  warnings?: { code: string; message: string }[]
}

function unwrapCart(result: CartMutationResult, op: string): Cart {
  if (result.userErrors && result.userErrors.length > 0) {
    console.log(`[v0] ${op} userErrors:`, JSON.stringify(result.userErrors))
    throw new Error(result.userErrors[0].message)
  }
  if (result.warnings && result.warnings.length > 0) {
    console.log(`[v0] ${op} warnings:`, JSON.stringify(result.warnings))
  }
  if (!result.cart) {
    throw new Error(`${op} returned no cart`)
  }
  return normalizeCart(result.cart)
}

// Fallback in-memory / local cart
const fallbackCarts: Record<string, Cart> = {}

function getOrCreateFallbackCart(cartId?: string): Cart {
  const id = cartId || `cart_${Date.now()}`
  if (!fallbackCarts[id]) {
    fallbackCarts[id] = {
      id,
      checkoutUrl: "#",
      totalQuantity: 0,
      cost: {
        subtotalAmount: { amount: "0.00", currencyCode: "USD" },
        totalAmount: { amount: "0.00", currencyCode: "USD" },
      },
      lines: [],
    }
  }
  return fallbackCarts[id]
}

function recalculateFallbackCart(cart: Cart): Cart {
  cart.totalQuantity = cart.lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = cart.lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  cart.cost.subtotalAmount.amount = total.toFixed(2)
  cart.cost.totalAmount.amount = total.toFixed(2)
  return { ...cart }
}

export async function clearCart(cartId: string): Promise<void> {
  if (fallbackCarts[cartId]) {
    fallbackCarts[cartId].lines = []
    fallbackCarts[cartId].totalQuantity = 0
    fallbackCarts[cartId].cost.subtotalAmount.amount = "0.00"
    fallbackCarts[cartId].cost.totalAmount.amount = "0.00"
  }
}

export async function createCart(): Promise<Cart> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!storeDomain || !accessToken) {
    return getOrCreateFallbackCart()
  }

  try {
    const data = await shopifyFetch<{ cartCreate: CartMutationResult }>({
      query: `
        ${CART_FRAGMENT}
        mutation CreateCart {
          cartCreate {
            cart { ...CartFields }
            userErrors { field message }
          }
        }
      `,
      cache: "no-store",
    })
    return unwrapCart(data.cartCreate, "cartCreate")
  } catch {
    return getOrCreateFallbackCart()
  }
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!storeDomain || !accessToken) {
    return fallbackCarts[cartId] ?? getOrCreateFallbackCart(cartId)
  }

  try {
    const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
      query: `
        ${CART_FRAGMENT}
        query GetCart($cartId: ID!) {
          cart(id: $cartId) { ...CartFields }
        }
      `,
      variables: { cartId },
      cache: "no-store",
    })
    return data.cart ? normalizeCart(data.cart) : (fallbackCarts[cartId] ?? null)
  } catch {
    return fallbackCarts[cartId] ?? null
  }
}

export async function addToCart(cartId: string, merchandiseId: string, quantity: number): Promise<Cart> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!storeDomain || !accessToken) {
    const cart = getOrCreateFallbackCart(cartId)
    const matchedProduct = FALLBACK_PRODUCTS.find(
      (p) => p.variantId === merchandiseId || p.shopifyId === merchandiseId || p.id === merchandiseId
    ) || FALLBACK_PRODUCTS[0]

    const existingLine = cart.lines.find((l) => l.merchandiseId === merchandiseId)
    if (existingLine) {
      existingLine.quantity += quantity
    } else {
      cart.lines.push({
        id: `line_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        quantity,
        merchandiseId,
        productHandle: matchedProduct.id,
        title: matchedProduct.name,
        image: matchedProduct.image,
        price: matchedProduct.price,
        currencyCode: matchedProduct.currencyCode,
      })
    }
    return recalculateFallbackCart(cart)
  }

  try {
    const data = await shopifyFetch<{ cartLinesAdd: CartMutationResult }>({
      query: `
        ${CART_FRAGMENT}
        mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart { ...CartFields }
            userErrors { field message }
            warnings { code message }
          }
        }
      `,
      variables: { cartId, lines: [{ merchandiseId, quantity }] },
      cache: "no-store",
    })
    return unwrapCart(data.cartLinesAdd, "cartLinesAdd")
  } catch {
    return addToCart(cartId, merchandiseId, quantity)
  }
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!storeDomain || !accessToken) {
    const cart = getOrCreateFallbackCart(cartId)
    const line = cart.lines.find((l) => l.id === lineId)
    if (line) {
      line.quantity = quantity
    }
    return recalculateFallbackCart(cart)
  }

  try {
    const data = await shopifyFetch<{ cartLinesUpdate: CartMutationResult }>({
      query: `
        ${CART_FRAGMENT}
        mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
          cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart { ...CartFields }
            userErrors { field message }
          }
        }
      `,
      variables: { cartId, lines: [{ id: lineId, quantity }] },
      cache: "no-store",
    })
    return unwrapCart(data.cartLinesUpdate, "cartLinesUpdate")
  } catch {
    const cart = getOrCreateFallbackCart(cartId)
    const line = cart.lines.find((l) => l.id === lineId)
    if (line) {
      line.quantity = quantity
    }
    return recalculateFallbackCart(cart)
  }
}

export async function removeCartLine(cartId: string, lineId: string): Promise<Cart> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!storeDomain || !accessToken) {
    const cart = getOrCreateFallbackCart(cartId)
    cart.lines = cart.lines.filter((l) => l.id !== lineId)
    return recalculateFallbackCart(cart)
  }

  try {
    const data = await shopifyFetch<{ cartLinesRemove: CartMutationResult }>({
      query: `
        ${CART_FRAGMENT}
        mutation RemoveCartLine($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart { ...CartFields }
            userErrors { field message }
          }
        }
      `,
      variables: { cartId, lineIds: [lineId] },
      cache: "no-store",
    })
    return unwrapCart(data.cartLinesRemove, "cartLinesRemove")
  } catch {
    const cart = getOrCreateFallbackCart(cartId)
    cart.lines = cart.lines.filter((l) => l.id !== lineId)
    return recalculateFallbackCart(cart)
  }
}
