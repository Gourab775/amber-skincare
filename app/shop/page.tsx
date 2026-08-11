import { getProducts } from "@/lib/shopify"
import { ShopContent } from "@/components/boty/shop-content"

export default async function ShopPage() {
  const products = await getProducts()
  return <ShopContent products={products} />
}
