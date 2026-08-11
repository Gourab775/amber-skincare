import { notFound } from "next/navigation"
import { getProduct } from "@/lib/shopify"
import { ProductDetail } from "@/components/boty/product-detail"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let product = null
  try {
    product = await getProduct(id)
  } catch {
    notFound()
  }

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} />
}
