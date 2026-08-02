export function SectionHeading({
  title,
  trailing,
}: {
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-balance text-ink sm:text-2xl">
        <span className="h-5 w-1.5 shrink-0 rounded-full bg-brand" />
        {title}
      </h2>
      {trailing}
    </div>
  );
}
