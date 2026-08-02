import type { Truck } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import { SectionHeading } from "./SectionHeading";

export function ReviewsSection({ truck }: { truck: Truck }) {
  const reviews = truck.reviews;

  if (reviews.length === 0) {
    return (
      <section>
        <SectionHeading title="Reviews" />
        <p className="mt-3 text-sm text-muted">No reviews yet — be the first to try this truck.</p>
      </section>
    );
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section>
      <SectionHeading
        title="Reviews"
        trailing={
          <span className="flex items-center gap-1 text-sm font-semibold text-ink">
            <StarIcon /> {average.toFixed(1)}
            <span className="font-normal text-muted">({reviews.length})</span>
          </span>
        }
      />

      <ul className="mt-4 space-y-3.5">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-card)] transition duration-200 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/15 to-brand/5 text-xs font-bold text-brand-dark ring-1 ring-brand/10">
                {review.reviewer_display_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{review.reviewer_display_name}</p>
                <p className="text-xs text-muted">{formatRelativeTime(review.created_at)}</p>
              </div>
              <div className="ml-auto flex shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} filled={i < review.rating} />
                ))}
              </div>
            </div>

            <p className="mt-2.5 text-pretty text-sm leading-relaxed text-ink/85">{review.text}</p>

            {review.owner_reply && (
              <div className="mt-3 rounded-xl border-l-2 border-brand/40 bg-surface/70 p-3">
                <p className="text-xs font-semibold text-muted">Reply from {truck.name}</p>
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
      className="h-3.5 w-3.5 text-star"
    >
      <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.09.99 5.77L10 14.77l-5.18 2.68.99-5.77L1.62 7.6l5.79-.84L10 1.5Z" />
    </svg>
  );
}
