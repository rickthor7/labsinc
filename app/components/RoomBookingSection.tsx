"use client";

import { useState } from "react";
import RoomBookingModal from "./RoomBookingModal";
import { Monitor, Network, Palette, Database, CalendarPlus, Search, X } from "lucide-react";

const ROOMS = [
    {
        name: "LAB_RPL",
        label: "Lab RPL",
        description: "Rekayasa Perangkat Lunak — Pengembangan software & coding",
        icon: Monitor,
        color: "from-blue-500 to-indigo-600",
    },
    {
        name: "LAB_JARKOM",
        label: "Lab Jarkom",
        description: "Jaringan Komputer — Networking & infrastruktur",
        icon: Network,
        color: "from-emerald-500 to-teal-600",
    },
    {
        name: "LAB_MM",
        label: "Lab MM",
        description: "Multimedia — Desain grafis, video editing & animasi",
        icon: Palette,
        color: "from-pink-500 to-rose-600",
    },
    {
        name: "LAB_SI",
        label: "Lab SI",
        description: "Sistem Informasi — Database & analisis sistem",
        icon: Database,
        color: "from-amber-500 to-orange-600",
    },
];

export default function RoomBookingSection() {
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRooms = ROOMS.filter((room) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            room.label.toLowerCase().includes(q) ||
            room.name.toLowerCase().includes(q) ||
            room.description.toLowerCase().includes(q)
        );
    });

    return (
        <>
            {/* Search Bar */}
            <div className="mb-6">
                <div className="group relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari ruangan laboratorium..."
                        className="w-full rounded-2xl border border-border bg-surface px-12 py-3.5 text-foreground shadow-lg shadow-primary/5 outline-none transition-all placeholder:text-muted/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    />
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Room Cards */}
            {filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-24">
                    <Search className="mb-4 h-12 w-12 text-muted/40" />
                    <h3 className="text-lg font-semibold text-foreground">
                        Ruangan Tidak Ditemukan
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                        Tidak ada ruangan yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {filteredRooms.map((room) => {
                        const Icon = room.icon;
                        return (
                            <div
                                key={room.name}
                                className="group relative flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                            >
                                {/* Icon */}
                                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${room.color} shadow-lg`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>

                                {/* Info */}
                                <h3 className="mb-1 text-lg font-bold text-foreground">{room.label}</h3>
                                <p className="mb-5 text-sm text-muted leading-relaxed">{room.description}</p>

                                {/* Book button */}
                                <div className="mt-auto">
                                    <button
                                        onClick={() => setActiveRoom(room.name)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
                                    >
                                        <CalendarPlus className="h-4 w-4" />
                                        Booking Ruangan
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            {ROOMS.map((room) => (
                <RoomBookingModal
                    key={room.name}
                    roomName={room.name}
                    roomLabel={room.label}
                    isOpen={activeRoom === room.name}
                    onClose={() => setActiveRoom(null)}
                />
            ))}
        </>
    );
}
