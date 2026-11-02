import Link from "next/link";
import { SCHEDULE_WINDOW_DAYS, type CityScheduleDay } from "@/lib/city-schedule";

/**
 * Server-rendered, so the dated schedule is in the raw HTML. Renders nothing
 * at all when no stops qualify: never an empty heading.
 */
export function CityScheduleSection({ cityName, days }: { cityName: string; days: CityScheduleDay[] }) {
  if (days.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="city-schedule-heading">
      <h2 id="city-schedule-heading" className="text-2xl font-black tracking-tight text-navy">
        Upcoming stops in and near {cityName}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Scheduled over the next {SCHEDULE_WINDOW_DAYS} days. Times are local to each stop.
      </p>

      <div className="mt-4 flex flex-col gap-5">
        {days.map((day) => (
          <div key={day.key}>
            <h3 className="text-sm font-bold text-navy/70">{day.label}</h3>
            <ul className="mt-2 flex flex-col gap-3">
              {day.stops.map((stop) => (
                <li key={stop.id}>
                  <Link
                    href={`/truck/${stop.truckSlug}`}
                    className="block rounded-2xl border border-border bg-white p-3.5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-4"
                  >
                    <p className="text-base font-bold text-ink">{stop.truckName}</p>
                    <p className="mt-0.5 text-sm font-semibold text-ink">{stop.timeLabel}</p>
                    <p className="mt-0.5 text-sm text-muted">{stop.locationText}</p>
                    {stop.note && <p className="mt-1 text-xs text-muted">{stop.note}</p>}
                    {stop.status === "delayed" && (
                      <span className="mt-1.5 inline-block rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                        Delayed
                      </span>
                    )}
                    {stop.status === "sold_out" && (
                      <span className="mt-1.5 inline-block rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                        Sold out
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
