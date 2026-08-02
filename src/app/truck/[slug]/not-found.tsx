import Link from "next/link";

export default function TruckNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="animate-fade-up">
        <h1 className="text-xl font-bold tracking-tight text-ink">We can&apos;t find that truck</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          This link may be out of date, or the truck isn&apos;t public yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-md active:translate-y-0 active:scale-[0.97]"
        >
          Back to TruckTap
        </Link>
      </div>
    </main>
  );
}
