import type { Truck } from "@/lib/types";

/**
 * FoodEstablishment JSON-LD, generated from the same data the visible page
 * renders — not a separate content effort. Server-rendered, invisible.
 */
export function StructuredData({ truck, url }: { truck: Truck; url: string }) {
  const aggregateRating =
    truck.reviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: (
            truck.reviews.reduce((sum, r) => sum + r.rating, 0) / truck.reviews.length
          ).toFixed(1),
          reviewCount: truck.reviews.length,
        }
      : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: truck.name,
    url,
    description: truck.bio ?? truck.description ?? undefined,
    telephone: truck.phone || undefined,
    servesCuisine: truck.cuisine_type || undefined,
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(truck.menu_items.length > 0
      ? {
          hasMenu: {
            "@type": "Menu",
            hasMenuItem: truck.menu_items.map((item) => ({
              "@type": "MenuItem",
              name: item.name,
              description: item.description,
              offers: {
                "@type": "Offer",
                price: item.price,
                priceCurrency: "USD",
              },
            })),
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
