import Link from "next/link";
import { SearchForm } from "@/components/search-form";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Main Container */}
      <div className="flex-grow flex flex-col items-center justify-center w-full px-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <img src="/icon.svg" alt="Zweefhulp" width={30} height={30} />
          </div>
          <h1 className="text-6xl font-bold text-gray-800 mb-2">
            Zweef<span className="text-blue-600">hulp</span>
          </h1>
          <p className="text-gray-600 text-sm mt-3">
            Doorzoek alle verkiezingsprogramma&apos;s voor de Tweede
            Kamerverkiezingen 2025 met AI
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl">
          <SearchForm />
        </div>

        {/* Suggested Search Terms */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {[
              "woningmarkt",
              "hypotheekrenteaftrek",
              "stikstof",
              "NAVO",
              "gaza",
              "normen en waarden",
              "startups",
              "asielzoekers",
              "zorgakkoord",
              "europa",
            ].map((term) => (
              <Link
                href={`/search?q=${encodeURIComponent(term).replace(
                  /%20/g,
                  "+"
                )}`}
                key={term}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>
            Een initiatief van{" "}
            <a
              href="https://gaal.co"
              className="text-blue-600 hover:text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Robert Gaal
            </a>{" "}
            en{" "}
            <a
              href="https://stefanborsje.com/"
              className="text-blue-600 hover:text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stefan Borsje
            </a>
          </p>
          <div className="flex gap-3">
            <a
              href="https://github.com/vesperlabs-com/zweefhulp"
              className="text-blue-600 hover:text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Broncode
            </a>
            <span>•</span>
            <a
              href="mailto:info@zweefhulp.nl"
              className="text-blue-600 hover:text-blue-700"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
