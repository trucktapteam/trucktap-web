import { FACEBOOK_URL } from "@/lib/home-data";

export function SiteFooter() {
  return (
    <footer className="px-4 pt-9 pb-11 font-bold text-navy/55 lg:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-navy/12 pt-6 sm:flex-row sm:items-center">
        <p>&copy; {new Date().getFullYear()} TruckTap. Built for real food truck discovery.</p>
        <div className="flex flex-wrap gap-4 font-black text-brand-dark">
          <a href="https://gettrucktap.com/privacy.html" target="_blank" rel="noopener noreferrer">
            Privacy
          </a>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
