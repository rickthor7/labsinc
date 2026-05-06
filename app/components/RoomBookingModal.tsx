"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { bookRoom } from "@/app/actions/laboratorium";
import { X, CalendarDays, Clock, Loader2, Send } from "lucide-react";
import { showAlert } from '@/app/lib/alert';

interface RoomBookingModalProps {
    roomName: string;
    roomLabel: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function RoomBookingModal({ roomName, roomLabel, isOpen, onClose }: RoomBookingModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (startTime >= endTime) {
            setError("Jam mulai harus lebih awal dari jam selesai.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await bookRoom(roomName, date, startTime, endTime);

                if (!result.success) {
                    if (result.error?.includes("login")) {
                        const confirmLogin = window.confirm(result.error + "\n\nLogin sekarang?");
                        if (confirmLogin) router.push("/login");
                    } else {
                        setError(result.error || "Gagal booking ruangan.");
                    }
                } else {
                    showAlert("✅ Booking berhasil diajukan! Status: PENDING.\nSilakan cek Dashboard untuk melihat status.");
                    setDate("");
                    setStartTime("");
                    setEndTime("");
                    setError("");
                    onClose();
                    router.refresh();
                }
            } catch (err) {
                setError("Terjadi kesalahan koneksi. Coba lagi.");
                console.error("Booking error:", err);
            }
        });
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-foreground">Booking Ruangan</h3>
                    <p className="mt-1 text-sm text-muted">
                        Formulir pemesanan <span className="font-semibold text-primary">{roomLabel}</span>
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            Tanggal
                        </label>
                        <div className="relative">
                            <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Jam Mulai
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Jam Selesai
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted transition-all hover:bg-surface-hover hover:text-foreground"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Booking
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Use portal to render at document.body level
    if (!mounted) return null;
    return createPortal(modalContent, document.body);
}
