import type { Metadata } from "next";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SITE_URL } from "@/lib/site";

const TITLE = "Privacy Policy";
const DESCRIPTION = "How TruckTap collects, uses, and protects your information.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: `${SITE_URL}/privacy`,
  },
};

/**
 * Verbatim migration of the policy previously published at
 * gettrucktap.com/privacy.html (the old GitHub Pages site) — same
 * wording, same facts, same contact address, just laid out with the
 * current site's header/footer/typography instead of raw inline-styled
 * HTML. This is the policy the App Store/Google Play listings already
 * point at, so the text itself is intentionally unchanged here.
 */
export default function PrivacyPage() {
  return (
    <div className="paper-grid flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1 px-4 py-10 sm:py-14 lg:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-balance text-4xl font-black tracking-tight text-navy sm:text-5xl">
            TruckTap Privacy Policy
          </h1>

          <div className="mt-6 flex flex-col gap-4 text-lg text-pretty text-navy/80">
            <p>
              TruckTap collects basic information such as location and contact details to provide core app
              functionality.
            </p>
            <p>We do not sell or share your personal data.</p>
            <p>Location data is used only to show nearby food trucks and improve the user experience.</p>
            <p>
              If you have any questions, contact us at:{" "}
              <a
                href="mailto:TruckTapTeam@gmail.com"
                className="font-bold text-brand-dark underline underline-offset-2"
              >
                TruckTapTeam@gmail.com
              </a>
            </p>
          </div>

          <p className="mt-8 text-sm font-semibold text-navy/50">Last updated: April 2026</p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
