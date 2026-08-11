import { getProducts } from "@/lib/shopify"
import { ShopContent } from "@/components/boty/shop-content"

export const dynamic = "force-dynamic"

export default async function ShopPage() {
  let products = []
  try {
    products = await getProducts()
  } catch {
    // Shopify env vars not configured — render page without products
  }
  return <ShopContent products={products} />
}
