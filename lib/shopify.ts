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
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

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
  const t = productType.toLowerCase()
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

export async function getProducts(): Promise<Product[]> {
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

  return data.products.edges.map((e) => normalizeProduct(e.node))
}

export async function getProduct(handle: string): Promise<Product | null> {
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

  return data.product ? normalizeProduct(data.product) : null
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

export async function createCart(): Promise<Cart> {
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
}

export async function getCart(cartId: string): Promise<Cart | null> {
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
  return data.cart ? normalizeCart(data.cart) : null
}

export async function addToCart(cartId: string, merchandiseId: string, quantity: number): Promise<Cart> {
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
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
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
}

export async function removeCartLine(cartId: string, lineId: string): Promise<Cart> {
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
}
