export function AppDownloadCta({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-ink to-brand-dark shadow-[var(--shadow-pop)] ${compact ? "p-5" : "p-6"}`}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-brand/30 blur-2xl" />

      <p className={`relative font-bold tracking-tight text-white ${compact ? "text-sm" : "text-base"}`}>
        Get the TruckTap app
      </p>
      <p className={`relative mt-1.5 text-white/70 ${compact ? "text-xs" : "text-sm"}`}>
        Everything on this page works without it. The app adds favorites, alerts
        when this truck goes live nearby, reminders, and check-ins.
      </p>
      <div className="relative mt-4 flex gap-2.5">
        <a
          href="https://apps.apple.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-white px-3 py-2.5 text-center text-xs font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.97]"
        >
          App Store
        </a>
        <a
          href="https://play.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-white px-3 py-2.5 text-center text-xs font-semibold text-ink shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.97]"
        >
          Google Play
        </a>
      </div>
    </section>
  );
}
