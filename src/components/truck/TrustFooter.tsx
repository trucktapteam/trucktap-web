import type { Truck } from "@/lib/types";

const BADGE_LABELS: Record<string, string> = {
  veteran_owned: "Veteran-Owned",
  family_owned: "Family-Owned",
};

export function TrustFooter({ truck }: { truck: Truck }) {
  const hasBadges = truck.trust_badges.length > 0;

  return (
    <section className="flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      {hasBadges && (
        <div className="flex flex-wrap gap-2 sm:mr-auto">
          {truck.trust_badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-border bg-white px-2.5 py-1 font-medium text-muted"
            >
              {BADGE_LABELS[badge] ?? badge}
            </span>
          ))}
        </div>
      )}
      <p>
        Profile last updated{" "}
        {new Date(truck.updated_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </section>
  );
}
