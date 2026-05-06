"use client";

import { useTransition } from "react";
import { approveBooking, rejectBooking, completeBooking } from "@/app/actions/laboratorium";
import { Check, X, CheckCircle2, Loader2 } from "lucide-react";
import { showAlert } from '@/app/lib/alert';

interface BookingAdminActionsProps {
    bookingId: string;
    status: string;
}

export default function BookingAdminActions({ bookingId, status }: BookingAdminActionsProps) {
    const [isApproving, startApprove] = useTransition();
    const [isRejecting, startReject] = useTransition();
    const [isCompleting, startComplete] = useTransition();

    // PENDING: Show Approve + Reject
    if (status === "PENDING") {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() =>
                        startApprove(async () => {
                            const result = await approveBooking(bookingId);
                            if (!result.success) {
                                showAlert(result.error || "Gagal menyetujui.");
                            }
                        })
                    }
                    disabled={isApproving || isRejecting}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 hover:shadow-sm disabled:cursor-wait disabled:opacity-50 dark:text-emerald-400"
                >
                    {isApproving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Check className="h-3.5 w-3.5" />
                    )}
                    Setujui
                </button>
                <button
                    onClick={() =>
                        startReject(async () => {
                            const result = await rejectBooking(bookingId);
                            if (!result.success) {
                                showAlert(result.error || "Gagal menolak.");
                            }
                        })
                    }
                    disabled={isApproving || isRejecting}
                    className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-500/20 hover:shadow-sm disabled:cursor-wait disabled:opacity-50 dark:text-red-400"
                >
                    {isRejecting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <X className="h-3.5 w-3.5" />
                    )}
                    Tolak
                </button>
            </div>
        );
    }

    // APPROVED: Show Complete button
    if (status === "APPROVED") {
        return (
            <button
                onClick={() =>
                    startComplete(async () => {
                        const result = await completeBooking(bookingId);
                        if (!result.success) {
                            alert(result.error || "Gagal menyelesaikan.");
                        }
                    })
                }
                disabled={isCompleting}
                className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-500/20 hover:shadow-sm disabled:cursor-wait disabled:opacity-50 dark:text-blue-400"
            >
                {isCompleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Tandai Selesai
            </button>
        );
    }

    // COMPLETED / REJECTED: No actions
    return null;
}
