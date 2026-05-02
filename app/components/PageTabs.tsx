"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Package, DoorOpen } from "lucide-react";

export default function PageTabs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "equipment";

    const tabs = [
        { id: "equipment", label: "Katalog Alat", icon: Package },
        { id: "rooms", label: "Booking Ruangan", icon: DoorOpen },
    ];

    return (
        <div className="flex items-center gap-1 rounded-xl bg-surface-hover p-1">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("tab", tab.id);
                            params.delete("q");
                            router.push(`/?${params.toString()}`, { scroll: false });
                        }}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                            isActive
                                ? "bg-surface text-foreground shadow-sm"
                                : "text-muted hover:text-foreground"
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
