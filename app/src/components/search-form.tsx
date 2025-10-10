"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { slugify } from "@/lib/slugify";

export function SearchForm() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const trimmedQuery = query.trim();
      router.push(`/zoeken/${slugify(trimmedQuery)}?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex items-center border border-gray-300 rounded-full px-5 py-3 hover:shadow-md transition-shadow focus-within:shadow-md">
        <svg
          className="w-5 h-5 text-gray-400 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          autoCapitalize='none'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op thema's, interesses, of onderwerpen..."
          className="flex-grow outline-none text-gray-700"
          autoComplete="off"
        />
      </div>
    </form>
  );
}
