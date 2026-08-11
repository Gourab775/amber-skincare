import { Header } from "@/components/boty/header"
import { Hero } from "@/components/boty/hero"
import { TrustBadges } from "@/components/boty/trust-badges"
import { FeatureSection } from "@/components/boty/feature-section"
import { ProductGrid } from "@/components/boty/product-grid"
import { IngredientsSection } from "@/components/boty/ingredients-section"
import { ImpactSection } from "@/components/boty/impact-section"
import { Testimonials } from "@/components/boty/testimonials"
import { CTABanner } from "@/components/boty/cta-banner"
import { Newsletter } from "@/components/boty/newsletter"
import { Footer } from "@/components/boty/footer"
import { getProducts } from "@/lib/shopify"

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getProducts>> = []
  try {
    products = await getProducts()
  } catch {
    // Shopify env vars not configured — render page without products
  }

  return (
    <main>
      <Header />
      <Hero />
      <TrustBadges />
      <div id="collection">
        <ProductGrid products={products} />
      </div>
      <div id="why-amber">
        <FeatureSection />
      </div>
      <div id="impact">
        <ImpactSection />
      </div>
      <div id="ingredients">
        <IngredientsSection />
      </div>
      <div id="reviews">
        <Testimonials />
      </div>
      <CTABanner />
      <Newsletter />
      <Footer />
    </main>
  )
}
