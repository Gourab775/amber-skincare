import { notFound } from "next/navigation"
import { getProduct, getProducts } from "@/lib/shopify"
import { ProductDetail } from "@/components/boty/product-detail"

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({ id: product.id }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} />
}
