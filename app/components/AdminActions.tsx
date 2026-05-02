"use client";

import { useTransition } from "react";
import { setujuiPinjaman, tolakPinjaman } from "@/app/actions/laboratorium";
import { Check, X, Loader2 } from "lucide-react";

interface AdminActionsProps {
    borrowingId: string;
}

export default function AdminActions({ borrowingId }: AdminActionsProps) {
    const [isApproving, startApprove] = useTransition();
    const [isRejecting, startReject] = useTransition();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() =>
                    startApprove(async () => {
                        const result = await setujuiPinjaman(borrowingId);
                        if (!result.success) {
                            alert(result.error || "Gagal menyetujui.");
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
                        const result = await tolakPinjaman(borrowingId);
                        if (!result.success) {
                            alert(result.error || "Gagal menolak.");
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
