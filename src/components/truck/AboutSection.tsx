import type { Truck } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";

export function AboutSection({ truck }: { truck: Truck }) {
  const text = truck.bio || truck.description;
  if (!text) return null;

  return (
    <section>
      <SectionHeading title="About" />
      <p className="mt-4 max-w-prose text-pretty whitespace-pre-line text-[0.95rem] leading-relaxed text-ink/85">
        {text}
      </p>
    </section>
  );
}
