"use client";

import { useTransition } from "react";
import { returnEquipment } from "@/app/actions/laboratorium";
import { RotateCcw, Loader2 } from "lucide-react";

interface ReturnButtonProps {
    borrowingId: string;
}

export default function ReturnButton({ borrowingId }: ReturnButtonProps) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() =>
                startTransition(async () => {
                    const result = await returnEquipment(borrowingId);
                    if (!result.success) {
                        alert(result.error || "Gagal mengembalikan alat.");
                    }
                })
            }
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 hover:shadow-sm disabled:cursor-wait disabled:opacity-50 dark:text-emerald-400"
        >
            {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <RotateCcw className="h-3.5 w-3.5" />
            )}
            Tandai Dikembalikan
        </button>
    );
}
