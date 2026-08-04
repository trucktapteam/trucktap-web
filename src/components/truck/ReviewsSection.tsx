import type { Truck } from "@/lib/types";
import { formatRelativeTime, getRatingSummary } from "@/lib/format";
import { SectionHeading } from "./SectionHeading";

export function ReviewsSection({ truck }: { truck: Truck }) {
  const reviews = truck.reviews;
  const ratingSummary = getRatingSummary(truck);

  if (!ratingSummary) {
    return (
      <section>
        <SectionHeading title="Reviews" />
        <p className="mt-3 text-sm text-muted">No reviews yet — be the first to try this truck.</p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading
        title="Reviews"
        trailing={
          <span className="flex items-center gap-1 text-sm font-semibold text-ink">
            <StarIcon /> {ratingSummary.average.toFixed(1)}
            <span className="font-normal text-muted">({ratingSummary.count})</span>
          </span>
        }
      />

      <ul className="mt-4 space-y-4">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-card)] transition duration-200 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/15 to-brand/5 text-xs font-bold text-brand-dark ring-1 ring-brand/10">
                {review.reviewer_display_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold text-ink">{review.reviewer_display_name}</p>
                  <div className="flex shrink-0" aria-label={`Rated ${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < review.rating} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted">{formatRelativeTime(review.created_at)}</p>
              </div>
            </div>

            <p className="mt-3 text-pretty text-sm leading-relaxed text-ink/85">{review.text}</p>

            {review.owner_reply && (
              <div className="mt-3.5 rounded-xl border-l-[3px] border-brand/50 bg-surface/70 p-3.5">
                <p className="text-xs font-bold text-brand-dark">Reply from {truck.name}</p>
                <p className="mt-1 text-sm text-ink/85">{review.owner_reply.body}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.2}
      aria-hidden="true"
      className="h-3.5 w-3.5 text-star"
    >
      <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.77l-5.18 2.68.99-5.77L1.62 7.6l5.79-.84L10 1.5Z" />
    </svg>
  );
}
