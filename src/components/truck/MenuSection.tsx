import type { MenuItem, Truck } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { PlaceholderImage } from "./PlaceholderImage";
import { SectionHeading } from "./SectionHeading";

export function MenuSection({ truck }: { truck: Truck }) {
  const hasItems = truck.menu_items.length > 0;
  const hasBoardPhotos = truck.menu_images.length > 0;

  // No section at all when there's nothing to show — never an empty shell.
  if (!hasItems && !hasBoardPhotos) return null;

  return (
    <section>
      <SectionHeading title="Menu" />

      {hasItems ? (
        <MenuItemGrid items={truck.menu_items} />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {truck.menu_images.map((seed, i) => (
            <PlaceholderImage
              key={seed}
              seed={seed}
              label={`Menu board ${i + 1}`}
              className="aspect-[3/4] rounded-xl shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MenuItemGrid({ items }: { items: MenuItem[] }) {
  const byCategory = new Map<string, MenuItem[]>();
  for (const item of items) {
    const category = item.category ?? "Menu";
    byCategory.set(category, [...(byCategory.get(category) ?? []), item]);
  }

  return (
    <div className="mt-4 space-y-6">
      {Array.from(byCategory.entries()).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted uppercase">
            <span className="h-1 w-1 rounded-full bg-brand/60" />
            {category}
          </h3>
          <ul className="mt-2.5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)]">
            {categoryItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 p-3.5 transition-colors duration-150 hover:bg-surface/60"
              >
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${item.available === false ? "text-muted" : "text-ink"}`}>
                    {item.name}
                    {item.available === false && (
                      <span className="ml-2 rounded-full bg-surface px-1.5 py-0.5 text-[11px] font-medium text-muted">
                        Sold out today
                      </span>
                    )}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-muted">{item.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-ink">
                  {formatCurrency(item.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
