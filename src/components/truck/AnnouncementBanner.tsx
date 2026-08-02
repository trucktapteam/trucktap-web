import type { Truck } from "@/lib/types";
import { getActiveAnnouncements } from "@/lib/format";

export function AnnouncementBanner({ truck }: { truck: Truck }) {
  const active = getActiveAnnouncements(truck);

  // No section at all when there's nothing active — never an empty banner shell.
  if (active.length === 0) return null;

  return (
    <section className="space-y-2.5">
      {active.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-gradient-to-br from-warning/[0.12] to-warning/5 px-4 py-3.5 text-sm font-medium text-ink shadow-sm"
        >
          <MegaphoneIcon />
          <span>{a.message}</span>
        </div>
      ))}
    </section>
  );
}

function MegaphoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-warning">
      <path
        fillRule="evenodd"
        d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206 24.6 24.6 0 0 1-4.831 1.243 3.75 3.75 0 1 1-7.48 0 24.6 24.6 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
