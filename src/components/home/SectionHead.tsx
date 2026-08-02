export function SectionHead({
  kicker,
  title,
  description,
  light = false,
}: {
  kicker: string;
  title: string;
  description?: string;
  /** Use on dark section backgrounds. */
  light?: boolean;
}) {
  return (
    <div className="mx-auto max-w-[790px] text-center">
      <span
        className={`mb-3 inline-flex text-sm font-black tracking-[0.08em] uppercase ${
          light ? "text-brand/80" : "text-brand-dark"
        }`}
      >
        {kicker}
      </span>
      <h2
        className={`text-balance text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-6xl ${
          light ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mx-auto mt-3.5 max-w-[680px] text-pretty text-base sm:text-lg ${
            light ? "text-white/74" : "text-muted"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
