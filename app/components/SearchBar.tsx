"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, FlaskConical, X } from "lucide-react";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams();
            if (query.trim()) {
                params.set("q", query.trim());
            }
            router.push(`/?${params.toString()}`, { scroll: false });
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, router]);

    return (
        <div className="group relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari alat laboratorium..."
                className="w-full rounded-2xl border border-border bg-surface px-12 py-3.5 text-foreground shadow-lg shadow-primary/5 outline-none transition-all placeholder:text-muted/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
            {query ? (
                <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            ) : (
                <FlaskConical className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted/40" />
            )}
        </div>
    );
}
